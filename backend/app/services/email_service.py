import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
from app.config import settings
from app.models.team_schemas import EmailInvitationData, TeamRole
from datetime import datetime

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # These should be added to your settings/environment variables
        self.smtp_server = getattr(settings, 'SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_username = getattr(settings, 'SMTP_USERNAME', '')
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', '')
        self.from_email = getattr(settings, 'FROM_EMAIL', 'noreply@lawverra.com')
        self.frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')

    def send_email(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
        """Send an email using SMTP"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.from_email
            message["To"] = to_email

            # Create the plain-text and HTML version of your message
            if text_content:
                part1 = MIMEText(text_content, "plain")
                message.attach(part1)

            part2 = MIMEText(html_content, "html")
            message.attach(part2)

            # Create secure connection and send email
            context = ssl.create_default_context()
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                if self.smtp_username and self.smtp_password:
                    server.login(self.smtp_username, self.smtp_password)
                
                server.sendmail(self.from_email, to_email, message.as_string())
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def send_team_invitation(self, invitation_data: EmailInvitationData, recipient_email: str) -> bool:
        """Send team invitation email"""
        
        # Generate invitation URL
        invitation_url = f"{self.frontend_url}/teams/join?token={invitation_data.invitation_token}"
        
        # Email subject
        subject = f"You're invited to join {invitation_data.team_name} on Lawverra"
        
        # HTML email template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Team Invitation</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ font-size: 24px; font-weight: bold; color: #c9a55c; }}
                .invitation-box {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c9a55c; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #c9a55c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
                .button:hover {{ background: #b8944f; }}
                .details {{ background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
                .role-badge {{ display: inline-block; padding: 4px 8px; background: #e3f2fd; color: #1976d2; border-radius: 4px; font-size: 12px; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">⚖️ Lawverra</div>
                    <h1>Team Invitation</h1>
                </div>
                
                <div class="invitation-box">
                    <h2>You've been invited to join a team!</h2>
                    <p><strong>{invitation_data.invited_by_name}</strong> has invited you to join <strong>{invitation_data.team_name}</strong> on Lawverra.</p>
                    
                    {f'<p style="font-style: italic; margin: 15px 0; padding: 10px; background: white; border-radius: 5px;">"{invitation_data.message}"</p>' if invitation_data.message else ''}
                </div>
                
                <div class="details">
                    <p><strong>Team:</strong> {invitation_data.team_name}</p>
                    <p><strong>Role:</strong> <span class="role-badge">{invitation_data.role.value.title()}</span></p>
                    <p><strong>Invited by:</strong> {invitation_data.invited_by_name}</p>
                    <p><strong>Expires:</strong> {invitation_data.expires_at.strftime('%B %d, %Y at %I:%M %p UTC')}</p>
                </div>
                
                <div style="text-align: center;">
                    <a href="{invitation_url}" class="button">Accept Invitation</a>
                </div>
                
                <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 5px; border: 1px solid #ffeaa7;">
                    <p style="margin: 0; font-size: 14px;"><strong>Don't have an account?</strong> No problem! Clicking the button above will guide you through creating your Lawverra account and joining the team.</p>
                </div>
                
                <div style="margin: 20px 0; font-size: 14px; color: #666;">
                    <p><strong>What you can do with {invitation_data.role.value.title()} access:</strong></p>
                    <ul>
                        {self._get_role_permissions(invitation_data.role)}
                    </ul>
                </div>
                
                <div class="footer">
                    <p>This invitation will expire on {invitation_data.expires_at.strftime('%B %d, %Y at %I:%M %p UTC')}.</p>
                    <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                    <p>© 2024 Lawverra. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text version
        text_content = f"""
        You're invited to join {invitation_data.team_name} on Lawverra!
        
        {invitation_data.invited_by_name} has invited you to join {invitation_data.team_name} with {invitation_data.role.value.title()} access.
        
        {f'Message: "{invitation_data.message}"' if invitation_data.message else ''}
        
        To accept this invitation, visit: {invitation_url}
        
        This invitation expires on {invitation_data.expires_at.strftime('%B %d, %Y at %I:%M %p UTC')}.
        
        If you don't have an account, you'll be guided through creating one when you accept the invitation.
        
        If you didn't expect this invitation, you can safely ignore this email.
        """
        
        return self.send_email(recipient_email, subject, html_content, text_content)

    def _get_role_permissions(self, role: TeamRole) -> str:
        """Get HTML list of permissions for a role"""
        permissions = {
            TeamRole.VIEWER: [
                "View team documents and files",
                "Receive team notifications",
                "Access team workspace"
            ],
            TeamRole.EDITOR: [
                "View team documents and files",
                "Edit and create documents",
                "Share documents with the team",
                "Receive team notifications",
                "Access team workspace"
            ],
            TeamRole.ADMIN: [
                "View team documents and files",
                "Edit and create documents",
                "Share documents with the team",
                "Invite new team members",
                "Manage team member roles",
                "Receive team notifications",
                "Access team workspace"
            ],
            TeamRole.OWNER: [
                "Full access to all team features",
                "Manage team settings",
                "Invite and remove team members",
                "Assign roles to team members",
                "Delete the team",
                "Access team workspace"
            ]
        }
        
        role_perms = permissions.get(role, permissions[TeamRole.VIEWER])
        return "".join([f"<li>{perm}</li>" for perm in role_perms])

    def send_role_change_notification(self, user_email: str, team_name: str, old_role: TeamRole, new_role: TeamRole, changed_by: str) -> bool:
        """Send notification when user's role is changed"""
        
        subject = f"Your role in {team_name} has been updated"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Role Update</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ font-size: 24px; font-weight: bold; color: #c9a55c; }}
                .notification-box {{ background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }}
                .role-badge {{ display: inline-block; padding: 4px 8px; background: #e3f2fd; color: #1976d2; border-radius: 4px; font-size: 12px; font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">⚖️ Lawverra</div>
                    <h1>Role Updated</h1>
                </div>
                
                <div class="notification-box">
                    <h2>Your role has been updated</h2>
                    <p>Your role in <strong>{team_name}</strong> has been changed from <span class="role-badge">{old_role.value.title()}</span> to <span class="role-badge">{new_role.value.title()}</span> by {changed_by}.</p>
                </div>
                
                <div style="margin: 20px 0; font-size: 14px; color: #666;">
                    <p><strong>What you can now do with {new_role.value.title()} access:</strong></p>
                    <ul>
                        {self._get_role_permissions(new_role)}
                    </ul>
                </div>
                
                <div class="footer">
                    <p>© 2024 Lawverra. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Your role in {team_name} has been updated.
        
        Your role has been changed from {old_role.value.title()} to {new_role.value.title()} by {changed_by}.
        
        Visit your team workspace to explore your new permissions.
        """
        
        return self.send_email(user_email, subject, html_content, text_content)

    def send_document_shared_notification(self, user_email: str, document_title: str, shared_by: str, team_name: Optional[str] = None) -> bool:
        """Send notification when a document is shared"""
        
        if team_name:
            subject = f"Document shared in {team_name}: {document_title}"
            context = f"in the team <strong>{team_name}</strong>"
        else:
            subject = f"Document shared with you: {document_title}"
            context = "with you directly"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document Shared</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }}
                .container {{ max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ font-size: 24px; font-weight: bold; color: #c9a55c; }}
                .notification-box {{ background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }}
                .footer {{ text-align: center; margin-top: 30px; font-size: 12px; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">⚖️ Lawverra</div>
                    <h1>Document Shared</h1>
                </div>
                
                <div class="notification-box">
                    <h2>📄 {document_title}</h2>
                    <p><strong>{shared_by}</strong> has shared the document "{document_title}" {context}.</p>
                </div>
                
                <div class="footer">
                    <p>© 2024 Lawverra. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Document Shared: {document_title}
        
        {shared_by} has shared the document "{document_title}" {context.replace('<strong>', '').replace('</strong>', '')}.
        
        Log in to Lawverra to view the document.
        """
        
        return self.send_email(user_email, subject, html_content, text_content)

# Create singleton instance
email_service = EmailService() 