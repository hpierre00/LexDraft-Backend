# LegalDoc SaaS API Documentation

## Base URL

```
BASE_URL = "http://localhost:8000/api/v1"
```

## Authentication

All routes except `/auth/register` and `/auth/login` require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Routes

### Authentication Routes

#### Register User

```http
POST /auth/register
```

Request Body:

```json
{
  "email": "user@example.com",
  "password": "your_secure_password"
}
```

Response:

```json
{
  "message": "User registered successfully",
  "data": {
    "user_id": "user_123",
    "email": "user@example.com",
    "status": "confirmation_email_sent"
  }
}
```

#### Login User

```http
POST /auth/login
```

Request Body:

```json
{
  "email": "user@example.com",
  "password": "your_secure_password"
}
```

Response:

```json
{
  "message": "Login successful",
  "data": {
    "access_token": "jwt_token_here",
    "token_type": "bearer",
    "user_id": "user_123",
    "email": "user@example.com"
  }
}
```

#### Get Current User

```http
GET /auth/user
```

Headers:

- `Authorization: Bearer <jwt_token>`

Response:

```json
{
  "data": {
    "id": "user_uuid",
    "email": "user@example.com",
    "email_confirmed": true
  }
}
```

### Document Routes

#### Create Document

```http
POST /documents/create
```

Request Body:

```json
{
  "title": "Sample Legal Document",
  "content": "This is the content of the legal document..."
}
```

Response:

```json
{
  "id": "uuid_here",
  "user_id": "user_uuid_here",
  "title": "Sample Legal Document",
  "content": "This is the content...",
  "status": "active",
  "created_at": "2024-03-20T10:00:00Z",
  "updated_at": "2024-03-20T10:00:00Z"
}
```

#### Get All Documents

```http
GET /documents
```

Response:

```json
[
  {
    "id": "uuid_here",
    "user_id": "user_uuid_here",
    "title": "Sample Legal Document",
    "content": "This is the content...",
    "status": "active",
    "created_at": "2024-03-20T10:00:00Z",
    "updated_at": "2024-03-20T10:00:00Z"
  }
]
```

### Template Routes

#### Create Template

```http
POST /templates/create
Content-Type: multipart/form-data

state: string (required)
document_type: string (required)
file: file (required, .docx)
```

Creates a new template. The file must be a .docx file.

Response:

```json
{
  "message": "Template created successfully",
  "file_path": "legal-templates/California/Non-Disclosure Agreement/template.docx"
}
```

#### List Templates

```http
GET /templates/list?state_id={state_id}&document_type_id={document_type_id}&search={search}
```

List templates with optional filters.

Query Parameters:

- `state_id` (optional): Filter by state ID
- `document_type_id` (optional): Filter by document type ID
- `search` (optional): Search in template name or content

Response:

```json
{
  "templates": [
    {
      "id": "uuid",
      "template_name": "string",
      "file_path": "string",
      "content": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "states": {
        "state_id": "string",
        "state_name": "string"
      },
      "document_types": {
        "document_type_id": "string",
        "document_type_name": "string"
      }
    }
  ]
}
```

#### Get Template by ID

```http
GET /templates/{template_id}
```

Get a specific template by ID with full details.

Response:

```json
{
  "id": "uuid",
  "template_name": "string",
  "file_path": "string",
  "content": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "states": {
    "state_id": "string",
    "state_name": "string"
  },
  "document_types": {
    "document_type_id": "string",
    "document_type_name": "string"
  }
}
```

#### Get Templates by State

```http
GET /templates/state/{state_id}
```

Get all templates for a specific state.

Response:

```json
{
  "templates": [
    {
      "id": "uuid",
      "template_name": "string",
      "file_path": "string",
      "content": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "document_types": {
        "document_type_id": "string",
        "document_type_name": "string"
      }
    }
  ]
}
```

#### Get Templates by Document Type

```http
GET /templates/type/{document_type_id}
```

Get all templates of a specific document type.

Response:

```json
{
  "templates": [
    {
      "id": "uuid",
      "template_name": "string",
      "file_path": "string",
      "content": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "states": {
        "state_id": "string",
        "state_name": "string"
      }
    }
  ]
}
```

#### Search Templates

```http
GET /templates/search?query={search_term}
```

Search templates by name or content.

Response:

```json
{
  "templates": [
    {
      "id": "uuid",
      "template_name": "string",
      "file_path": "string",
      "content": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "states": {
        "state_id": "string",
        "state_name": "string"
      },
      "document_types": {
        "document_type_id": "string",
        "document_type_name": "string"
      }
    }
  ]
}
```

#### Delete Template

```http
DELETE /templates/{template_id}
```

Delete a template by ID.

Response:

```json
{
  "message": "Template deleted successfully"
}
```

### AI Agent Routes

#### Generate Document

```http
POST /ai/generate-document
Content-Type: multipart/form-data

prompt: string (required)
title: string (required)
state_id: string (optional)
document_type_id: string (optional)
```

Generate a legal document using AI. If state_id and document_type_id are provided, uses a template as context.

Response:

```json
{
  "message": "Document generated and saved successfully",
  "document": {
    "id": "uuid",
    "title": "string",
    "content": "string",
    "status": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "template_used": {
    "state": "string",
    "document_type": "string"
  }
}
```

#### Review Document

```http
POST /ai/review-document
Content-Type: multipart/form-data

file: file (required)
title: string (required)
evaluation_criteria: string (optional, default: "General legal review")
```

Review a legal document using AI.

Response:

```json
{
  "message": "Document reviewed successfully",
  "feedback": "string"
}
```

#### Edit Template

```http
POST /ai/edit-template
Content-Type: multipart/form-data

template_path: string (required)
user_command: string (required)
title: string (required)
```

Edit a template using AI.

Response:

```json
{
  "message": "Template edited successfully",
  "updated_path": "string"
}
```

## Error Responses

All routes may return the following error responses:

```json
{
  "detail": "Error message here"
}
```

Common status codes:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

API requests are limited to:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## File Upload Limits

- Maximum file size: 10MB
- Allowed file types: .docx, .pdf
