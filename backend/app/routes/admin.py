from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, List, Optional
from app.models.database import supabase
from app.utils.auth_utils import get_current_user
from datetime import datetime, timedelta, timezone
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def require_admin(user: dict = Depends(get_current_user)):
    """Dependency to ensure user is admin"""
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@router.get("/users")
async def get_all_users(admin: dict = Depends(require_admin)):
    """Get all users for admin dashboard"""
    try:
        response = supabase.from_("profiles").select("*").execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@router.get("/contacts")
async def get_all_contacts(admin: dict = Depends(require_admin)):
    """Get all contact form submissions"""
    try:
        response = supabase.from_("contacts").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching contacts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch contacts")

@router.get("/support-tickets")
async def get_all_support_tickets(admin: dict = Depends(require_admin)):
    """Get all support tickets"""
    try:
        response = supabase.from_("support_tickets").select("*").order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching support tickets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch support tickets")

@router.get("/analytics/overview")
async def get_analytics_overview(
    days: int = Query(30, description="Number of days to look back"),
    admin: dict = Depends(require_admin)
):
    """Get comprehensive analytics overview"""
    try:
        # Calculate date range
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # Get document statistics
        docs_response = supabase.from_("documents").select("*").execute()
        documents = docs_response.data or []
        
        # Get user statistics
        users_response = supabase.from_("profiles").select("*").execute()
        users = users_response.data or []
        
        # Get template statistics
        templates_response = supabase.from_("templates").select("*").execute()
        templates = templates_response.data or []
        
        # Get contact statistics
        contacts_response = supabase.from_("contacts").select("*").execute()
        contacts = contacts_response.data or []
        
        # Get support ticket statistics
        support_response = supabase.from_("support_tickets").select("*").execute()
        support_tickets = support_response.data or []
        
        # Calculate comprehensive statistics
        total_documents = len(documents)
        documents_by_status = {}
        documents_by_type = {}
        documents_this_period = 0
        evaluated_documents = 0
        enhanced_documents = 0
        generated_documents = 0
        
        for doc in documents:
            # Count by status
            status = doc.get('status', 'unknown')
            documents_by_status[status] = documents_by_status.get(status, 0) + 1
            
            # Count by evaluation
            if doc.get('evaluation_response'):
                evaluated_documents += 1
            
            # Count enhanced and generated
            if status == 'enhanced':
                enhanced_documents += 1
            elif status == 'draft' or status == 'active':
                generated_documents += 1
            
            # Count documents in time period
            if doc.get('created_at'):
                try:
                    doc_date_str = doc['created_at']
                    if doc_date_str.endswith('Z'):
                        doc_date_str = doc_date_str.replace('Z', '+00:00')
                    elif '+' not in doc_date_str and doc_date_str.count(':') == 2:
                        doc_date_str = doc_date_str + '+00:00'
                    doc_date = datetime.fromisoformat(doc_date_str)
                    if doc_date.tzinfo is None:
                        doc_date = doc_date.replace(tzinfo=start_date.tzinfo)
                    if doc_date >= start_date:
                        documents_this_period += 1
                except (ValueError, TypeError):
                    continue
        
        # User statistics
        total_users = len(users)
        admin_users = len([u for u in users if u.get('is_admin')])
        attorney_users = len([u for u in users if u.get('role') == 'attorney'])
        self_users = len([u for u in users if u.get('role') == 'self'])
        users_this_period = 0
        
        for user in users:
            if user.get('created_at'):
                try:
                    user_date_str = user['created_at']
                    if user_date_str.endswith('Z'):
                        user_date_str = user_date_str.replace('Z', '+00:00')
                    elif '+' not in user_date_str and user_date_str.count(':') == 2:
                        user_date_str = user_date_str + '+00:00'
                    user_date = datetime.fromisoformat(user_date_str)
                    if user_date.tzinfo is None:
                        user_date = user_date.replace(tzinfo=start_date.tzinfo)
                    if user_date >= start_date:
                        users_this_period += 1
                except (ValueError, TypeError):
                    continue
        
        # Contact and support statistics
        total_contacts = len(contacts)
        total_support_tickets = len(support_tickets)
        
        contacts_this_period = 0
        support_this_period = 0
        
        for contact in contacts:
            if contact.get('created_at'):
                try:
                    contact_date_str = contact['created_at']
                    if contact_date_str.endswith('Z'):
                        contact_date_str = contact_date_str.replace('Z', '+00:00')
                    elif '+' not in contact_date_str and contact_date_str.count(':') == 2:
                        contact_date_str = contact_date_str + '+00:00'
                    contact_date = datetime.fromisoformat(contact_date_str)
                    if contact_date.tzinfo is None:
                        contact_date = contact_date.replace(tzinfo=start_date.tzinfo)
                    if contact_date >= start_date:
                        contacts_this_period += 1
                except (ValueError, TypeError):
                    continue
        
        for ticket in support_tickets:
            if ticket.get('created_at'):
                try:
                    ticket_date_str = ticket['created_at']
                    if ticket_date_str.endswith('Z'):
                        ticket_date_str = ticket_date_str.replace('Z', '+00:00')
                    elif '+' not in ticket_date_str and ticket_date_str.count(':') == 2:
                        ticket_date_str = ticket_date_str + '+00:00'
                    ticket_date = datetime.fromisoformat(ticket_date_str)
                    if ticket_date.tzinfo is None:
                        ticket_date = ticket_date.replace(tzinfo=start_date.tzinfo)
                    if ticket_date >= start_date:
                        support_this_period += 1
                except (ValueError, TypeError):
                    continue
        
        # Support ticket breakdown
        tickets_by_type = {}
        tickets_by_status = {}
        
        for ticket in support_tickets:
            ticket_type = ticket.get('type', 'unknown')
            tickets_by_type[ticket_type] = tickets_by_type.get(ticket_type, 0) + 1
            
            ticket_status = ticket.get('status', 'open')
            tickets_by_status[ticket_status] = tickets_by_status.get(ticket_status, 0) + 1
        
        return {
            "period_days": days,
            "documents": {
                "total": total_documents,
                "this_period": documents_this_period,
                "by_status": documents_by_status,
                "evaluated": evaluated_documents,
                "enhanced": enhanced_documents,
                "generated": generated_documents,
                "templates_available": len(templates)
            },
            "users": {
                "total": total_users,
                "this_period": users_this_period,
                "admins": admin_users,
                "attorneys": attorney_users,
                "self_users": self_users,
                "by_role": {
                    "attorney": attorney_users,
                    "self": self_users,
                    "admin": admin_users
                }
            },
            "engagement": {
                "total_contacts": total_contacts,
                "contacts_this_period": contacts_this_period,
                "total_support_tickets": total_support_tickets,
                "support_this_period": support_this_period,
                "tickets_by_type": tickets_by_type,
                "tickets_by_status": tickets_by_status
            }
        }
    except Exception as e:
        logger.error(f"Error fetching analytics overview: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics overview")

@router.get("/analytics/daily-activity")
async def get_daily_activity(
    days: int = Query(30, description="Number of days to look back"),
    admin: dict = Depends(require_admin)
):
    """Get daily activity breakdown for charts"""
    try:
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # Initialize daily data structure
        daily_data = {}
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            daily_data[date_str] = {
                'date': date_str,
                'documents_created': 0,
                'documents_evaluated': 0,
                'documents_enhanced': 0,
                'users_registered': 0,
                'contacts_submitted': 0,
                'support_tickets': 0
            }
            current_date += timedelta(days=1)
        
        # Get documents data
        docs_response = supabase.from_("documents").select("*").gte("created_at", start_date.isoformat()).execute()
        documents = docs_response.data or []
        
        for doc in documents:
            if doc.get('created_at'):
                try:
                    doc_date_str = doc['created_at']
                    if doc_date_str.endswith('Z'):
                        doc_date_str = doc_date_str.replace('Z', '+00:00')
                    elif '+' not in doc_date_str and doc_date_str.count(':') == 2:
                        doc_date_str = doc_date_str + '+00:00'
                    doc_date = datetime.fromisoformat(doc_date_str)
                    date_str = doc_date.strftime('%Y-%m-%d')
                    if date_str in daily_data:
                        daily_data[date_str]['documents_created'] += 1
                        if doc.get('evaluation_response'):
                            daily_data[date_str]['documents_evaluated'] += 1
                        if doc.get('status') == 'enhanced':
                            daily_data[date_str]['documents_enhanced'] += 1
                except (ValueError, TypeError):
                    continue
        
        # Get users data
        users_response = supabase.from_("profiles").select("*").gte("created_at", start_date.isoformat()).execute()
        users = users_response.data or []
        
        for user in users:
            if user.get('created_at'):
                try:
                    user_date_str = user['created_at']
                    if user_date_str.endswith('Z'):
                        user_date_str = user_date_str.replace('Z', '+00:00')
                    elif '+' not in user_date_str and user_date_str.count(':') == 2:
                        user_date_str = user_date_str + '+00:00'
                    user_date = datetime.fromisoformat(user_date_str)
                    date_str = user_date.strftime('%Y-%m-%d')
                    if date_str in daily_data:
                        daily_data[date_str]['users_registered'] += 1
                except (ValueError, TypeError):
                    continue
        
        # Get contacts data
        contacts_response = supabase.from_("contacts").select("*").gte("created_at", start_date.isoformat()).execute()
        contacts = contacts_response.data or []
        
        for contact in contacts:
            if contact.get('created_at'):
                try:
                    contact_date_str = contact['created_at']
                    if contact_date_str.endswith('Z'):
                        contact_date_str = contact_date_str.replace('Z', '+00:00')
                    elif '+' not in contact_date_str and contact_date_str.count(':') == 2:
                        contact_date_str = contact_date_str + '+00:00'
                    contact_date = datetime.fromisoformat(contact_date_str)
                    date_str = contact_date.strftime('%Y-%m-%d')
                    if date_str in daily_data:
                        daily_data[date_str]['contacts_submitted'] += 1
                except (ValueError, TypeError):
                    continue
        
        # Get support tickets data
        support_response = supabase.from_("support_tickets").select("*").gte("created_at", start_date.isoformat()).execute()
        support_tickets = support_response.data or []
        
        for ticket in support_tickets:
            if ticket.get('created_at'):
                try:
                    ticket_date_str = ticket['created_at']
                    if ticket_date_str.endswith('Z'):
                        ticket_date_str = ticket_date_str.replace('Z', '+00:00')
                    elif '+' not in ticket_date_str and ticket_date_str.count(':') == 2:
                        ticket_date_str = ticket_date_str + '+00:00'
                    ticket_date = datetime.fromisoformat(ticket_date_str)
                    date_str = ticket_date.strftime('%Y-%m-%d')
                    if date_str in daily_data:
                        daily_data[date_str]['support_tickets'] += 1
                except (ValueError, TypeError):
                    continue
        
        return list(daily_data.values())
    except Exception as e:
        logger.error(f"Error fetching daily activity: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch daily activity")

@router.get("/analytics/documents")
async def get_document_analytics(admin: dict = Depends(require_admin)):
    """Get detailed document analytics"""
    try:
        # Get all documents with detailed analysis
        docs_response = supabase.from_("documents").select("*").execute()
        documents = docs_response.data or []
        
        # Document type analysis (based on title keywords)
        document_types = {
            'NDA': 0,
            'Contract': 0,
            'Agreement': 0,
            'Letter': 0,
            'Form': 0,
            'Other': 0
        }
        
        status_breakdown = {}
        monthly_creation = {}
        user_document_count = {}
        compliance_results = {'passed': 0, 'failed': 0, 'warnings': 0, 'not_checked': 0}
        
        for doc in documents:
            # Analyze document type by title
            title = doc.get('title', '').lower()
            categorized = False
            for doc_type in document_types.keys():
                if doc_type.lower() in title:
                    document_types[doc_type] += 1
                    categorized = True
                    break
            if not categorized:
                document_types['Other'] += 1
            
            # Status breakdown
            status = doc.get('status', 'unknown')
            status_breakdown[status] = status_breakdown.get(status, 0) + 1
            
            # Monthly creation
            if doc.get('created_at'):
                try:
                    doc_date_str = doc['created_at']
                    if doc_date_str.endswith('Z'):
                        doc_date_str = doc_date_str.replace('Z', '+00:00')
                    elif '+' not in doc_date_str and doc_date_str.count(':') == 2:
                        doc_date_str = doc_date_str + '+00:00'
                    doc_date = datetime.fromisoformat(doc_date_str)
                    month_key = doc_date.strftime('%Y-%m')
                    monthly_creation[month_key] = monthly_creation.get(month_key, 0) + 1
                except (ValueError, TypeError):
                    continue
            
            # User document count
            user_id = doc.get('user_id')
            if user_id:
                user_document_count[user_id] = user_document_count.get(user_id, 0) + 1
            
            # Compliance analysis
            compliance = doc.get('compliance_check_results')
            if compliance:
                if isinstance(compliance, dict):
                    score = compliance.get('compliance_score', 0)
                    if score >= 0.8:
                        compliance_results['passed'] += 1
                    elif score >= 0.6:
                        compliance_results['warnings'] += 1
                    else:
                        compliance_results['failed'] += 1
                else:
                    compliance_results['not_checked'] += 1
            else:
                compliance_results['not_checked'] += 1
        
        # Top users by document count
        top_users = sorted(user_document_count.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            "total_documents": len(documents),
            "document_types": document_types,
            "status_breakdown": status_breakdown,
            "monthly_creation": monthly_creation,
            "compliance_results": compliance_results,
            "top_users": [{"user_id": user_id, "document_count": count} for user_id, count in top_users],
            "average_documents_per_user": len(documents) / max(len(user_document_count), 1)
        }
    except Exception as e:
        logger.error(f"Error fetching document analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch document analytics")

@router.get("/analytics/export")
async def export_analytics_data(
    format: str = Query("json", description="Export format: json or csv"),
    admin: dict = Depends(require_admin)
):
    """Export analytics data in various formats"""
    try:
        # Get all data for export
        overview = await get_analytics_overview(days=365, admin=admin)
        daily_activity = await get_daily_activity(days=365, admin=admin)
        document_analytics = await get_document_analytics(admin=admin)
        
        users_response = supabase.from_("profiles").select("*").execute()
        contacts_response = supabase.from_("contacts").select("*").execute()
        support_response = supabase.from_("support_tickets").select("*").execute()
        docs_response = supabase.from_("documents").select("*").execute()
        
        export_data = {
            "export_timestamp": datetime.now().isoformat(),
            "overview": overview,
            "daily_activity": daily_activity,
            "document_analytics": document_analytics,
            "raw_data": {
                "users": users_response.data or [],
                "contacts": contacts_response.data or [],
                "support_tickets": support_response.data or [],
                "documents": docs_response.data or []
            }
        }
        
        if format == "csv":
            # For CSV, we'll return a simplified format focusing on daily activity
            return {
                "message": "CSV export functionality would be implemented here",
                "data": daily_activity
            }
        else:
            return export_data
            
    except Exception as e:
        logger.error(f"Error exporting analytics data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to export analytics data") 