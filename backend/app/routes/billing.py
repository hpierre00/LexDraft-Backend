# app/routes/billing.py
import stripe # type: ignore
from fastapi import APIRouter, Depends, Request, HTTPException, Header, BackgroundTasks, Body
from fastapi.security import HTTPAuthorizationCredentials
from app.config import settings, PRICE_ID_TO_PLAN, PLAN_NAME_TO_PRICE_ID
from app.utils.auth_utils import get_current_user, security
from app.utils import db_utils # Import your database utility functions
from app.models.billing_schemas import (
    CreateCheckoutSessionRequest,
    CreateOneTimePaymentRequest,
    UserStatusResponse
)
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any
import traceback
from app.models.database import supabase

# Initialize Stripe client
stripe.api_key = settings.STRIPE_SECRET_KEY

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# --- Helper Function to Convert Timestamps ---
def to_unix_timestamp(dt: datetime | None) -> int | None:
    """Converts an aware datetime object to a Unix timestamp."""
    if dt and dt.tzinfo:
        return int(dt.timestamp())
    # If it's a naive datetime, assume UTC (adjust if your DB stores differently)
    # Note: Supabase TIMESTAMPTZ usually includes timezone info
    elif dt:
         return int(dt.replace(tzinfo=timezone.utc).timestamp())
    return None


@router.get("/config", summary="Get Stripe Publishable Key")
async def get_stripe_config():
    """
    Provides the Stripe publishable key to the frontend.
    
    Returns:
    ```json
    {
        "publishableKey": "pk_test_1234567890"
    }
    ```
    """
    return {"publishableKey": settings.STRIPE_PUBLISHABLE_KEY}


@router.post("/create-checkout-session", summary="Create Subscription Checkout Session")
async def create_checkout_session(
    price_id: str = Body(...),
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Create a Stripe Checkout session for subscription.
    """
    try:
        logger.info(f"Creating checkout session for user: {user['id']} with price: {price_id}")
        
        try:
            # Get or create Stripe customer
            profile_response = supabase.from_("profiles").select("stripe_customer_id").eq("id", user["id"]).single().execute()
            
            if not profile_response.data or not profile_response.data.get("stripe_customer_id"):
                # Create new Stripe customer
                customer = stripe.Customer.create(
                    email=user["email"],
                    metadata={"user_id": user["id"]}
                )
                
                # Update profile with Stripe customer ID
                supabase.from_("profiles").update({
                    "stripe_customer_id": customer.id
                }).eq("id", user["id"]).execute()
                
                customer_id = customer.id
            else:
                customer_id = profile_response.data["stripe_customer_id"]
            
            # Create checkout session
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[{
                    "price": price_id,
                    "quantity": 1
                }],
                mode="subscription",
                success_url=settings.FRONTEND_URL + "/billing?success=true",
                cancel_url=settings.FRONTEND_URL + "/billing?canceled=true"
            )
            
            logger.info(f"Created checkout session for user: {user['id']}")
            return {
                "session_id": session.id,
                "url": session.url
            }
        except Exception as stripe_error:
            logger.error(f"Checkout session creation failed: {str(stripe_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error creating checkout session: {str(stripe_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in create_checkout_session: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/create-onetime-payment", summary="Create One-Time Payment Session")
async def create_onetime_payment(
    data: CreateOneTimePaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Creates a Stripe Checkout Session for a one-time purchase (add-ons).
    
    Example request body:
    ```json
    {
        "priceId": "price_doc_payg_123",
        "quantity": 5
    }
    ```
    
    Returns:
    ```json
    {
        "sessionId": "cs_test_1234567890",
        "url": "https://checkout.stripe.com/pay/cs_test_1234567890"
    }
    ```
    """
    user_id = current_user["id"]
    user_email = current_user["email"] # Get email for customer creation if needed
    price_id = data.priceId
    quantity = data.quantity

    # Validate Price ID belongs to a known one-time product
    if price_id not in [settings.PRICE_DOC_PAYG, settings.PRICE_AI_REPORT]:
         raise HTTPException(status_code=400, detail="Invalid priceId for one-time purchase.")
    if quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")

    try:
        # User must exist and preferably have a Stripe customer ID
        stripe_customer_id = await db_utils.maybe_create_stripe_customer(user_id, user_email)

        logging.info(f"Creating one-time payment session for customer {stripe_customer_id}, price {price_id}, qty {quantity}")
        checkout_session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': quantity}],
            mode='payment', # One-time payment mode
            success_url=f'{settings.FRONTEND_URL}/payment/success?type=onetime&item={price_id}&qty={quantity}',
            cancel_url=f'{settings.FRONTEND_URL}/payment/canceled',
            metadata={
                'app_user_id': user_id,
                'purchase_type': 'one-time',
                'item_price_id': price_id,
                'quantity': quantity # Store quantity for webhook handler
            }
        )
        logging.info(f"One-time payment session created: {checkout_session.id}")
        return {"sessionId": checkout_session.id}

    except HTTPException as he:
        raise he
    except Exception as e:
        logging.error(f"Error creating one-time payment session for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not create payment session: {str(e)}")


@router.post("/create-portal-session", summary="Create Customer Portal Session")
async def create_portal_session(
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Create a Stripe Customer Portal session.
    """
    try:
        logger.info(f"Creating portal session for user: {user['id']}")
        
        try:
            # Get user's Stripe customer ID
            response = supabase.from_("profiles").select("stripe_customer_id").eq("id", user["id"]).single().execute()
            
            if not response.data or not response.data.get("stripe_customer_id"):
                raise HTTPException(
                    status_code=400,
                    detail="No Stripe customer ID found"
                )
            
            # Create portal session
            session = stripe.billing_portal.Session.create(
                customer=response.data["stripe_customer_id"],
                return_url=settings.FRONTEND_URL + "/billing"
            )
            
            logger.info(f"Created portal session for user: {user['id']}")
            return {
                "url": session.url
            }
        except Exception as stripe_error:
            logger.error(f"Portal session creation failed: {str(stripe_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error creating portal session: {str(stripe_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in create_portal_session: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/user/status", response_model=UserStatusResponse, summary="Get User Subscription Status & Limits")
async def get_user_status(
    user: dict = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get the current user's billing status.
    """
    try:
        logger.info(f"Getting billing status for user: {user['id']}")
        
        try:
            # Get user's subscription status from database
            response = supabase.from_("subscriptions").select("*").eq("user_id", user["id"]).single().execute()
            
            if not response.data:
                logger.info(f"No subscription found for user: {user['id']}")
                return {
                    "status": "inactive",
                    "subscription": None
                }
            
            logger.info(f"Found subscription for user: {user['id']}")
            return {
                "status": "active",
                "subscription": response.data
            }
        except Exception as query_error:
            logger.error(f"Subscription fetch failed: {str(query_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error fetching subscription status: {str(query_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_user_status: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
    )


# --- Stripe Webhook Handler ---
# This endpoint should NOT require authentication (Depends(get_current_user))
# as it's called directly by Stripe. Use signature verification instead.
@router.post("/webhook", include_in_schema=False) # Hide from OpenAPI docs
async def handle_webhook(
    request: Dict[str, Any] = Body(...)
) -> Dict[str, str]:
    """
    Handle Stripe webhook events.
    """
    try:
        logger.info("Received Stripe webhook")
        
        try:
            event = request
            
            # Handle the event
            if event["type"] == "customer.subscription.created":
                subscription = event["data"]["object"]
                user_id = subscription["metadata"]["user_id"]
                
                # Update user's subscription status
                supabase.from_("subscriptions").insert({
                    "user_id": user_id,
                    "stripe_subscription_id": subscription["id"],
                    "status": subscription["status"],
                    "current_period_end": subscription["current_period_end"]
                }).execute()
                
                logger.info(f"Created subscription for user: {user_id}")
                
            elif event["type"] == "customer.subscription.updated":
                subscription = event["data"]["object"]
                user_id = subscription["metadata"]["user_id"]
                
                # Update subscription status
                supabase.from_("subscriptions").update({
                    "status": subscription["status"],
                    "current_period_end": subscription["current_period_end"]
                }).eq("stripe_subscription_id", subscription["id"]).execute()
                
                logger.info(f"Updated subscription for user: {user_id}")
                
            elif event["type"] == "customer.subscription.deleted":
                subscription = event["data"]["object"]
                user_id = subscription["metadata"]["user_id"]
                
                # Mark subscription as canceled
                supabase.from_("subscriptions").update({
                    "status": "canceled"
                }).eq("stripe_subscription_id", subscription["id"]).execute()
                
                logger.info(f"Canceled subscription for user: {user_id}")
            
            return {"status": "success"}
        except Exception as webhook_error:
            logger.error(f"Webhook handling failed: {str(webhook_error)}")
            raise HTTPException(
                status_code=400,
                detail=f"Error processing webhook: {str(webhook_error)}"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in handle_webhook: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )