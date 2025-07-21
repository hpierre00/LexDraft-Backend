# app/utils/db_utils.py
from app.models.database import supabase
from fastapi import HTTPException
import logging
import stripe # type: ignore # Import stripe here if needed for customer creation logic
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

async def get_profile(user_id: str) -> dict | None:
    """Fetches the user profile from the 'profiles' table."""
    try:
        response = supabase.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
        # Removed debug logging
        if response.data:
            # Convert timestamp strings from Supabase to Unix timestamps if needed elsewhere
            # For now, returning the raw data which might include ISO strings
            return response.data
        return None
    except Exception as e:
        logging.error(f"Error fetching profile for user {user_id}: {e}")
        # Don't raise HTTPException here, let the calling endpoint handle it
        return None

async def update_profile(user_id: str, data: dict) -> dict:
    """Updates the user profile in the 'profiles' table."""
    # Ensure 'updated_at' is set, though Supabase might handle this with triggers
    data['updated_at'] = 'now()' # Use Supabase function
    try:
        response = supabase.table("profiles").update(data).eq("id", user_id).execute()
        # Removed debug logging
        if not response.data:
             # Attempt to fetch again in case update succeeded but returned no data
             updated_profile = await get_profile(user_id)
             if updated_profile:
                 return updated_profile
             logging.error(f"Failed to update profile for user {user_id} or fetch updated data.")
             raise HTTPException(status_code=500, detail="Failed to update user profile data.")
        return response.data[0] # Return the updated profile data
    except HTTPException as he:
         raise he # Re-raise HTTP exceptions
    except Exception as e:
        logging.error(f"Error updating profile for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error during profile update.")


async def create_profile_if_not_exists(user_id: str, email: str, role: str = "self") -> dict:
    """Creates a profile row if it doesn't exist, returns existing or new profile."""
    profile = await get_profile(user_id)
    if profile:
        return profile
    try:
        logging.info(f"Creating profile entry for new user {user_id} ({email})")
        response = supabase.table("profiles").insert({
            "id": user_id,
            "email": email,
            "role": role,
            # Add other default fields if necessary
        }).execute()
        # Removed debug logging
        if response.data:
            return response.data[0]
        else:
            # Maybe profile was created just now by another request? Try fetching again.
            profile = await get_profile(user_id)
            if profile:
                return profile
            logging.error(f"Failed to create profile or retrieve after creation for user {user_id}")
            raise HTTPException(status_code=500, detail="Could not create user profile.")
    except Exception as e:
        # Check for unique constraint violation (email might exist if profile creation failed previously)
        if "duplicate key value violates unique constraint" in str(e) or "uniqueness constraint" in str(e):
             logging.warning(f"Profile creation conflict for {user_id}, likely already exists. Fetching.")
             profile = await get_profile(user_id)
             if profile: return profile
        logging.error(f"Error creating profile for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Database error during profile creation.")


async def maybe_create_stripe_customer(user_id: str, email: str) -> str:
    """
    Gets the Stripe Customer ID from the profile.
    If it doesn't exist, creates a Stripe Customer and updates the profile.
    Returns the Stripe Customer ID.
    """
    profile = await get_profile(user_id)
    if not profile:
        # Ensure profile exists before proceeding
        profile = await create_profile_if_not_exists(user_id, email)

    if profile and profile.get("stripe_customer_id"):
        return profile["stripe_customer_id"]

    # Create Stripe customer
    try:
        logging.info(f"Creating Stripe customer for user {user_id} ({email})")
        customer = stripe.Customer.create(
            email=email,
            metadata={'app_user_id': user_id} # Link Stripe customer to your user ID
        )
        stripe_customer_id = customer.id
        logging.info(f"Stripe customer created: {stripe_customer_id} for user {user_id}")

        # Update profile with the new Stripe Customer ID
        await update_profile(user_id, {"stripe_customer_id": stripe_customer_id})
        return stripe_customer_id
    except Exception as e:
        logging.error(f"Error creating Stripe customer for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not create Stripe customer: {str(e)}")

# --- Add functions for usage tracking if needed ---
async def increment_usage(user_id: str, counter_field: str, amount: int = 1):
    """ Atomically increments a usage counter (requires DB setup/policy). """
    # This might require specific Supabase functions or RLS policies
    # for atomicity. A simpler approach for now might be read-modify-write,
    # but be aware of race conditions under high load.
    # Example (Non-atomic, use with caution or implement atomic increment):
    profile = await get_profile(user_id)
    if profile and counter_field in profile:
        current_count = profile[counter_field] or 0
        await update_profile(user_id, {counter_field: current_count + amount})
    else:
        logging.warning(f"Could not increment {counter_field} for user {user_id}: Profile or field not found.")

async def reset_monthly_usage(user_id: str):
    """ Resets monthly counters (call from invoice.paid webhook). """
    await update_profile(user_id, {
        "doc_count_this_month": 0,
        "ai_summary_count_this_month": 0
    })

async def grant_payg_allowance(user_id: str, item_price_id: str, quantity: int):
     """ Grants allowance based on one-time purchase. """
     if item_price_id == settings.PRICE_DOC_PAYG:
         profile = await get_profile(user_id)
         if profile:
             current_allowance = profile.get("additional_doc_allowance", 0) or 0
             await update_profile(user_id, {"additional_doc_allowance": current_allowance + quantity})
             logging.info(f"Granted {quantity} additional doc allowance to user {user_id}")
     # Add elif for PRICE_AI_REPORT if it grants a credit instead of immediate use

async def get_client_profile(attorney_id: str, client_profile_id: str) -> dict | None:
    """
    Fetches a client profile for a specific attorney from the 'client_profiles' table.
    """
    try:
        response = supabase.table("client_profiles").select("*").eq("id", client_profile_id).eq("attorney_id", attorney_id).maybe_single().execute()
        # Removed debug logging
        if response.data:
            return response.data
        return None
    except Exception as e:
        logging.error(f"Error fetching client profile {client_profile_id} for attorney {attorney_id}: {e}")
        return None