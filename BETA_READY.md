# Lawverra Beta Testing Implementation Plan

---

## 1. Profile Management System (Self & Attorney)

### Goal

Introduce complete profile setup for clients and attorneys, including ability to manage folders and client-specific documents.

### Backend Tasks

- **Models Update**:
  - `ProfileInfo` (modified to make `user_id` optional for input, with improved Swagger examples)
  - `ClientFolder` (new model for attorney-managed client folders, with improved Swagger examples)
  - `ClientProfileCreate` (new model for attorney creating client profiles, with improved Swagger examples)
  - `ClientProfileResponse` (new model for client profile responses, with improved Swagger examples)
  - `DocumentCreate` and `DocumentResponse` now include an optional `client_profile_id` (UUID of the client profile if the document is created for a specific client).
- **Authentication Routes (`backend/app/routes/auth.py`)**:
  - `/register`: Modified to only create `auth.users` entry; profile creation (including `role`) moved to `/setup-profile`.
  - `/setup-profile`: Updated to accept full `ProfileInfo` (including `role`) for the authenticated user's own profile. This handles initial profile creation and subsequent updates.
- **New Client Management Routes (`backend/app/routes/clients.py`)**:
  - **`is_attorney_user` dependency**: Ensures only users with `role: "attorney"` can access client management endpoints.
  - Implemented comprehensive CRUD operations (Create, List, Get, Update, Delete) for `client_profiles` and `client_folders`.
  - All endpoints use `response_model` for clear Swagger documentation of successful responses and raise `HTTPException` with appropriate status codes (e.g., `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`) for error conditions, ensuring clear Swagger error schema display.
- **Document Routes (`backend/app/routes/document.py`)**:
  - All document creation, upload, retrieval, update, and deletion endpoints modified to enforce ownership: authenticated `user_id` matches document's `user_id`.
  - For attorneys, documents can now also be linked via `client_profile_id`. Access is granted if the authenticated attorney owns that `client_profile_id`, ensuring client-specific document management with proper authorization.
- **Database Schema Updates**:
  - `public.profiles` table altered to include `full_name`, `address`, `phone_number`, `gender`, `date_of_birth`, `state`, `city`, `zip_code`, `role`, and `updated_at`.
  - New `public.client_profiles` table created (linked to `public.profiles.id` as `attorney_id`).
  - New `public.client_folders` table created (linked to `public.profiles.id` as `attorney_id` and `public.client_profiles.id` as `client_profile_id`).
  - `public.documents` table altered to include an optional `client_profile_id` column (foreign key to `public.client_profiles`).
  - New `public.is_attorney(user_id)` SQL function created for RLS to facilitate authorization checks.
  - Updated RLS policies for `public.profiles`, and new RLS policies for `public.client_profiles`, `public.client_folders`, and `public.documents` to ensure granular data isolation (e.g., attorneys can only access documents tied to their clients, and individual users only their own documents).

**Status: COMPLETE**

### Frontend Tasks

- **After Registration/Initial Login**:
  - Prompt user to complete their **own profile** via the `/auth/setup-profile` endpoint.
  - Fields for user's own profile: Full Name, Address, Phone, Gender, DOB, State, City, Zip, **Role (Self/Attorney)**. This is a critical initial setup.
- **Dashboard (if user's role is 'attorney')**:
  - Display a section like "Client Management" or "Case Room".
  - Implement a button/flow for "Add New Client" which opens a form for `ClientProfileCreate`.
  - Display a list of clients (`GET /attorney/clients/list`).
  - Allow attorneys to view/edit details of a specific client (`GET/PUT /attorney/clients/{client_id}`).
  - Allow attorneys to create/list/manage client folders (`POST/GET/PUT/DELETE /attorney/clients/{client_id}/folders`).
  - Display client folders and the documents within them.
- **Document Generation UI**:
  - If the user is an attorney, provide an option to select whether the document is for "Self" or for an "Existing Client".
  - If "Existing Client" is selected, display a dropdown list of clients fetched from `/attorney/clients/list`.
  - Ensure that when generating a document for a client, the `client_profile_id` (UUID of the selected client) is sent to the backend's document creation endpoint (`POST /documents/create`).

### API Integration Details

All endpoints use standard HTTP status codes for success (e.g., 200 OK, 201 Created) and failure (e.g., 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error). Detailed error messages are provided in the `detail` field of the JSON response for `HTTPException`.

#### A. Authentication Routes (Prefix: `/auth`)

1.  **`POST /auth/register`**

    - **Description**: Registers a new user with Supabase Auth.
    - **Request Body**:
      ```json
      {
        "email": "user@example.com",
        "password": "strongpassword"
      }
      ```
    - **Response (200 OK)**:
      ```json
      {
        "message": "Registration successful. Please check your email to confirm your account.",
        "user_id": "uuid-of-new-user",
        "email": "user@example.com"
      }
      ```
    - **Error Responses**:
      - `400 Bad Request`: Invalid input (e.g., weak password).
      - `500 Internal Server Error`: Database or Supabase Auth issue.

2.  **`POST /auth/login`**

    - **Description**: Logs in a user and provides session tokens.
    - **Request Body**:
      ```json
      {
        "email": "user@example.com",
        "password": "strongpassword"
      }
      ```
    - **Response (200 OK)**:
      ```json
      {
        "access_token": "jwt-access-token",
        "refresh_token": "jwt-refresh-token",
        "user_id": "uuid-of-logged-in-user",
        "email": "user@example.com"
      }
      ```
    - **Error Responses**:
      - `401 Unauthorized`: Invalid email or password, or email not confirmed.
      - `500 Internal Server Error`: Supabase Auth issue.

3.  **`POST /auth/setup-profile`**
    - **Description**: Creates or updates the _authenticated user's own_ profile.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Request Body (`ProfileInfo`)**:
      ```json
      {
        "user_id": "uuid-of-authenticated-user",
        "full_name": "John Doe",
        "first_name": "John",
        "last_name": "Doe",
        "address": "123 Main St",
        "phone_number": "555-123-4567",
        "gender": "Male",
        "date_of_birth": "1990-01-15",
        "state": "FL",
        "city": "Orlando",
        "zip_code": "32801",
        "role": "self" // or "attorney"
      }
      ```
    - **Response (200 OK)**:
      ```json
      {
        "message": "Profile updated successfully",
        "profile": {
          "id": "uuid-of-user-profile",
          "user_id": "uuid-of-authenticated-user",
          "full_name": "John Doe",
          "first_name": "John",
          "last_name": "Doe",
          "address": "123 Main St",
          "phone_number": "555-123-4567",
          "gender": "Male",
          "date_of_birth": "1990-01-15",
          "state": "FL",
          "city": "Orlando",
          "zip_code": "32801",
          "role": "self",
          "created_at": "2024-07-20T10:00:00.000Z",
          "updated_at": "2024-07-20T10:00:00.000Z"
        }
      }
      ```
    - **Error Responses**:
      - `401 Unauthorized`: Missing or invalid token.
      - `403 Forbidden`: Mismatched `user_id` in payload and authenticated user.
      - `500 Internal Server Error`: Database error during profile update.

#### B. Client Management Routes (Prefix: `/attorney`)

**Note**: All endpoints under `/attorney` require the authenticated user to have the `role: "attorney"` in their `public.profiles` table. A `403 Forbidden` will be returned otherwise.

1.  **`POST /attorney/clients/create`**

    - **Description**: Create a new client profile for the authenticated attorney.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Request Body (`ClientProfileCreate`)**:
      ```json
      {
        "full_name": "Alice Smith",
        "address": "456 Oak Ave",
        "phone_number": "555-987-6543",
        "gender": "Female",
        "date_of_birth": "1985-05-20",
        "state": "NY",
        "city": "New York",
        "zip_code": "10001"
      }
      ```
    - **Response (200 OK - `ClientProfileResponse`)**:
      ```json
      {
        "id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
        "user_id": null, // user_id is null for client profiles
        "full_name": "Alice Smith",
        "address": "456 Oak Ave",
        "phone_number": "555-987-6543",
        "gender": "Female",
        "date_of_birth": "1985-05-20",
        "state": "NY",
        "city": "New York",
        "zip_code": "10001",
        "role": "client", // Auto-assigned role for client profiles
        "attorney_id": "550e8400-e29b-41d4-a716-446655440000",
        "created_at": "2024-07-20T10:00:00.000Z",
        "updated_at": "2024-07-20T10:00:00.000Z"
      }
      ```
    - **Error Responses**:
      - `401 Unauthorized`: Missing or invalid token.
      - `403 Forbidden`: User is not an attorney.
      - `500 Internal Server Error`: Database error.

2.  **`GET /attorney/clients/list`**

    - **Description**: List all client profiles belonging to the authenticated attorney.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Response (200 OK - List of `ClientProfileResponse`)**:
      ```json
      [
        {
          "id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
          "user_id": null,
          "full_name": "Alice Smith",
          "address": "456 Oak Ave",
          "phone_number": "555-987-6543",
          "gender": "Female",
          "date_of_birth": "1985-05-20",
          "state": "NY",
          "city": "New York",
          "zip_code": "10001",
          "role": "client",
          "attorney_id": "550e8400-e29b-41d4-a716-446655440000",
          "created_at": "2024-07-20T10:00:00.000Z",
          "updated_at": "2024-07-20T10:00:00.000Z"
        },
        {
          "id": "c3d4e5f6-a7b8-9012-3456-7890abcdef01",
          "user_id": null,
          "full_name": "Bob Johnson",
          "address": "789 Pine Ln",
          "phone_number": "555-222-3333",
          "gender": "Male",
          "date_of_birth": "1978-11-01",
          "state": "CA",
          "city": "Los Angeles",
          "zip_code": "90001",
          "role": "client",
          "attorney_id": "550e8400-e29b-41d4-a716-446655440000",
          "created_at": "2024-07-20T10:05:00.000Z",
          "updated_at": "2024-07-20T10:05:00.000Z"
        }
      ]
      ```
    - **Error Responses**:
      - `401 Unauthorized`: Missing or invalid token.
      - `403 Forbidden`: User is not an attorney.
      - `500 Internal Server Error`: Database error.

3.  **`GET /attorney/clients/{client_id}`**

    - **Description**: Get a specific client profile by ID.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Path Parameters**: `client_id` (UUID of the client profile)
    - **Response (200 OK - `ClientProfileResponse`)**:
      ```json
      {
        "id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
        "user_id": null,
        "full_name": "Alice Smith",
        "address": "456 Oak Ave",
        "phone_number": "555-987-6543",
        "gender": "Female",
        "date_of_birth": "1985-05-20",
        "state": "NY",
        "city": "New York",
        "zip_code": "10001",
        "role": "client",
        "attorney_id": "550e8400-e29b-41d4-a716-446655440000",
        "created_at": "2024-07-20T10:00:00.000Z",
        "updated_at": "2024-07-20T10:00:00.000Z"
      }
      ```
    - **Error Responses**:
      - `401 Unauthorized`: Missing or invalid token.
      - `403 Forbidden`: User is not an attorney.
      - `404 Not Found`: Client profile not found or does not belong to the attorney.
      - `500 Internal Server Error`: Database error.

4.  **`PUT /attorney/clients/{client_id}`**

    - **Description**: Update a specific client profile by ID.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Path Parameters**: `client_id` (UUID of the client profile)
    - **Request Body (`ClientProfileCreate` - partial updates allowed)**:
      ```json
      {
        "full_name": "Alicia M. Smith",
        "phone_number": "555-111-2222"
      }
      ```
    - **Response (200 OK - `ClientProfileResponse`)**:
      ```json
      {
        "id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
        "user_id": null,
        "full_name": "Alicia M. Smith",
        "address": "456 Oak Ave",
        "phone_number": "555-111-2222",
        "gender": "Female",
        "date_of_birth": "1985-05-20",
        "state": "NY",
        "city": "New York",
        "zip_code": "10001",
        "role": "client",
        "attorney_id": "550e8400-e29b-41d4-a716-446655440000",
        "created_at": "2024-07-20T10:00:00.000Z",
        "updated_at": "2024-07-20T10:00:00.000Z"
      }
      ```
    - **Error Responses**:
      - `401 Unauthorized`: Missing or invalid token.
      - `403 Forbidden`: User is not an attorney.
      - `404 Not Found`: Client profile not found or does not belong to the attorney.
      - `500 Internal Server Error`: Database error.

5.  **`DELETE /attorney/clients/{client_id}`**

    - **Description**: Delete a specific client profile by ID.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Path Parameters**: `client_id` (UUID of the client profile)
    - **Response (200 OK)**:
      ```json
      {
        "message": "Client profile deleted successfully."
      }
      ```
    - **Error Responses**:
      - `401 Unauthorized`: Missing or invalid token.
      - `403 Forbidden`: User is not an attorney.
      - `404 Not Found`: Client profile not found or does not belong to the attorney.
      - `500 Internal Server Error`: Database error.

6.  **`POST /attorney/clients/{client_id}/folders/create`**

    - **Description**: Create a new folder for a specific client.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Path Parameters**: `client_id` (UUID of the client profile)
    - **Request Body**:
      ```json
      {
        "folder_name": "Divorce Case Documents"
      }
      ```
    - **Response (200 OK - `ClientFolder`)**:
      ```json
      {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "attorney_id": "550e8400-e29b-41d4-a716-446655440000",
        "client_profile_id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
        "folder_name": "Divorce Case Documents",
        "created_at": "2024-07-20T10:00:00.000Z"
      }
      ```
    - **Error Responses**:
      - `401 Unauthorized`: Missing or invalid token.
      - `403 Forbidden`: User is not an attorney.
      - `404 Not Found`: Client not found or not accessible by the attorney.
      - `500 Internal Server Error`: Database error.

7.  **`GET /attorney/clients/{client_id}/folders/list`**

    - **Description**: List all folders for a specific client.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Path Parameters**: `client_id` (UUID of the client profile)
    - **Response (200 OK - List of `ClientFolder`)**:
      ```json
      [
        {
          "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "attorney_id": "550e8400-e29b-41d4-a716-446655440000",
          "client_profile_id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
          "folder_name": "Divorce Case Documents",
          "created_at": "2024-07-20T10:00:00.000Z"
        },
        {
          "id": "d5e6f7a8-b9c0-1234-5678-90abcdef0123",
          "attorney_id": "550e8400-e29b-41d4-a716-446655440000",
          "client_profile_id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
          "folder_name": "Property Deeds",
          "created_at": "2024-07-20T10:05:00.000Z"
        }
      ]
      ```
    - **Error Responses**:
      - `401 Unauthorized`: Missing or invalid token.
      - `403 Forbidden`: User is not an attorney.
      - `404 Not Found`: Client not found or not accessible by the attorney.
      - `500 Internal Server Error`: Database error.

8.  **`PUT /attorney/clients/{client_id}/folders/{folder_id}`**

    - **Description**: Update a specific client folder.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Path Parameters**: `client_id` (UUID of the client profile), `folder_id` (UUID of the folder)
    - **Request Body**:
      ```json
      {
        "folder_name": "Updated Divorce Case Files"
      }
      ```
    - **Response (200 OK - `ClientFolder`)**:
      ```json
      {
        "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        "attorney_id": "550e8400-e29b-41d4-a716-446655440000",
        "client_profile_id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0",
        "folder_name": "Updated Divorce Case Files",
        "created_at": "2024-07-20T10:00:00.000Z",
        "updated_at": "2024-07-20T10:00:00.000Z"
      }
      ```
    - **Error Responses**:
      - `401 Unauthorized`: Missing or invalid token.
      - `403 Forbidden`: User is not an attorney.
      - `404 Not Found`: Folder not found or not accessible by the attorney/client.
      - `500 Internal Server Error`: Database error.

9.  **`DELETE /attorney/clients/{client_id}/folders/{folder_id}`**
    - **Description**: Delete a specific client folder.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Path Parameters**: `client_id` (UUID of the client profile), `folder_id` (UUID of the folder)
    - **Response (200 OK)**:
      ```json
      {
        "message": "Client folder deleted successfully."
      }
      ```
    - **Error Responses**:
      - `401 Unauthorized`: Missing or invalid token.
      - `403 Forbidden`: User is not an attorney.
      - `404 Not Found`: Folder not found or not accessible by the attorney/client.
      - `500 Internal Server Error`: Database error.

#### C. Document Routes (Prefix: `/documents`)

**Note**: All endpoints here perform checks based on the `user_id` (authenticated user's ID) and, if present, the `client_profile_id` associated with the document. Attorneys can access documents linked to their clients.

1.  **`POST /documents/create`**

    - **Description**: Creates a new document.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Request Body (`DocumentCreate`)**:
      ```json
      {
        "title": "My New Document",
        "content": "This is the content of my document.",
        "client_profile_id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0" // Optional: Include if generating for a client
      }
      ```
    - **Response (200 OK - `DocumentResponse`)**:
      ```json
      {
        "id": "uuid-of-new-document",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "My New Document",
        "content": "This is the content of my document.",
        "status": "draft",
        "created_at": "2024-07-20T10:00:00.000Z",
        "updated_at": "2024-07-20T10:00:00.000Z",
        "evaluation_response": null,
        "client_profile_id": "b2c3d4e5-f6a7-8901-2345-67890abcdef0"
      }
      ```
    - **Error Responses**: `401 Unauthorized`, `500 Internal Server Error`.

2.  **`POST /documents/upload`**

    - **Description**: Uploads a document (PDF/DOCX) for content extraction and evaluation.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Request Body**: `file` (multipart/form-data)
    - **Response (200 OK - `DocumentResponse`)**: Includes `user_id` and `client_profile_id` (if provided).
    - **Error Responses**: `400 Bad Request` (unsupported file type, no content extracted), `401 Unauthorized`, `500 Internal Server Error`.

3.  **`GET /documents/list`**

    - **Description**: Lists documents filtered by authenticated user (and attorney's clients).
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Query Parameters**: `status` (optional, e.g., 'active', 'archived'), `search` (optional, text search in title/content).
    - **Response (200 OK - List of `DocumentResponse`)**: Example is a list of documents.
    - **Error Responses**: `401 Unauthorized`, `500 Internal Server Error`.

4.  **`GET /documents/{document_id}`**

    - **Description**: Retrieves a specific document.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Path Parameters**: `document_id`
    - **Response (200 OK - `DocumentResponse`)**: Example is a single document object.
    - **Error Responses**: `401 Unauthorized`, `404 Not Found` (document not found or not authorized), `500 Internal Server Error`.

5.  **`PUT /documents/{document_id}`**

    - **Description**: Updates a specific document.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Path Parameters**: `document_id`
    - **Request Body (`DocumentUpdate` - partial updates allowed)**: `title`, `content`.
    - **Response (200 OK - `DocumentResponse`)**: Example is the updated document object.
    - **Error Responses**: `400 Bad Request` (no update data), `401 Unauthorized`, `404 Not Found` (document not found or not authorized), `500 Internal Server Error`.

6.  **`DELETE /documents/{document_id}`**

    - **Description**: Deletes a specific document.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Path Parameters**: `document_id`
    - **Response (200 OK)**: `{"message": "Document deleted successfully"}`
    - **Error Responses**: `401 Unauthorized`, `404 Not Found` (document not found or not authorized), `500 Internal Server Error`.

7.  **`PUT /documents/{document_id}/archive`**

    - **Description**: Archives a specific document.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Path Parameters**: `document_id`
    - **Response (200 OK - `DocumentResponse`)**: Example is the archived document object.
    - **Error Responses**: `401 Unauthorized`, `404 Not Found` (document not found or not authorized), `500 Internal Server Error`.

8.  **`GET /documents/{document_id}/download` (PDF) & `/documents/{document_id}/download-docx` (DOCX)**
    - **Description**: Downloads a document as PDF or DOCX.
    - **Headers**: `Authorization: Bearer <access_token>`
    - **Path Parameters**: `document_id`
    - **Response (File Response)**: Binary file data.
    - **Error Responses**: `401 Unauthorized`, `404 Not Found` (document not found or not authorized), `500 Internal Server Error`.

---

## 2. Document Generator Agent Upgrade

### Goal

Upgrade agent to support document type detection, area of law selection, and personalized document generation, leveraging user and client profiles.

### Backend Tasks

- Add `DocumentTemplate` model:

  ```python
  class DocumentTemplate(BaseModel):
      id: UUID
      title: str
      document_type: DocumentType  # filing, letter, etc.
      area_of_law: AreaOfLaw     # divorce, nda, etc.
      jurisdiction: str    # e.g. Florida
      template_text: str
  ```

- Add enums:

  - `DocumentType`: Filing, Letter, Petition, Motion, Notice
  - `AreaOfLaw` (dropdown values):
    - Family Law
    - Modifications
    - Civil Litigation
    - Probate
    - Landlord-Tenant
    - Business Transactional
    - Legal Aid
    - Pro Se
    - NDA
    - Employment
    - Contracts
    - Wills and Trusts
    - Real Estate

- **Implement `DocumentGenerateRequest` schema** in `backend/app/models/schemas.py` to accept structured inputs for generation: `title`, `document_type`, `area_of_law`, `client_profile_id`, `notes`, and `jurisdiction`.
- **Enhance `generate_legal_document` function** in `backend/app/services/ai_agent_generate.py`:
  - Modify to accept `notes`, `document_type`, `area_of_law`, `jurisdiction`, `user_profile_data`, and `client_profile_data`.
  - Incorporate logic to fetch relevant `DocumentTemplate` content based on `document_type`, `area_of_law`, and `jurisdiction`.
  - Update AI prompt system and user messages to leverage structured inputs and profile information for document population and contextual generation.
  - Make the function asynchronous (`async def`).
- **Integrate into `create_document` endpoint** in `backend/app/routes/document.py`:
  - Update to use `DocumentGenerateRequest` as the input body.
  - Fetch `user_profile_data` for all users, and `client_profile_data` for attorneys generating for clients.
  - Pass all structured inputs, `user_profile_data`, and `client_profile_data` to `generate_legal_document`.
  - Ensure `client_profile_id` is converted to string for database serialization.
- **Implement `get_template_content_by_criteria`** in `backend/app/services/ai_agent_template.py` to retrieve templates from Supabase.
- **Implement `get_client_profile`** in `backend/app/utils/db_utils.py` to fetch client profiles linked to an attorney.

**Status: COMPLETE**

### Frontend Tasks

- Document Generation UI:

  - Implement new dropdowns for **Document Type**, **Area of Law**, and **Jurisdiction**.
  - Add a **Client Profile** dropdown, conditionally displayed for attorneys, allowing selection between "Self" or an "Existing Client" (fetched from `/attorney/clients/list`).
  - Introduce a freeform **Notes** box for additional context or specific requirements.
  - Ensure **auto-filled fields** based on the selected user/client profile (Name, Address, Phone, etc.) are correctly handled and passed to the backend.

- Backend call:

  - Construct structured payload for `POST /documents/create` endpoint, including `title`, `document_type`, `area_of_law`, `client_profile_id` (if applicable), `notes`, and `jurisdiction`.

---

## 3. Evaluation Agent Enhancements

### Goal

Add risk scoring, loophole detection, strategic legal recommendations, automated extraction of key document metadata (e.g., parties, dates, subject matter), and generation of a concise summary of the evaluation agent's findings and actions for the user. Additionally, provide detailed insights into the document's strengths, weaknesses, and concrete recommendations for updates.

### Backend Tasks

- Extend evaluation API (response from `/documents/upload` and `evaluate_legal_document`):

  ```json
  {
    "risk_score": "High | Moderate | Low",
    "loopholes": ["Clause X is vague", "No indemnification"],
    "strategy": "Consider including a force majeure clause.",
    "metadata": {
      // Extracted key-value pairs from the document. All values are strings.
      "parties": "John Doe, Jane Smith",
      "document_date": "2024-07-26",
      "subject": "Consultation Agreement"
    },
    "evaluation_summary": "This document was evaluated for potential risks and loopholes. A moderate risk score was assigned due to the absence of an indemnification clause. It is recommended to add a force majeure clause and clarify vague terms related to XYZ.",
    "weaknesses": [
      "Lack of specific deadline for document submission",
      "Unclear consequences for failure to provide requested documents"
    ],
    "strengths": [
      "Clear summary of consultation points",
      "Instructions on gathering relevant documents provided"
    ],
    "recommendations_for_update": [
      "Include a specific deadline (e.g., 'within 14 days')",
      "Clearly outline consequences for non-compliance"
    ],
    "strategies_for_update": [
      "Enhance communication with the client",
      "Establish follow-up protocol to track document collection"
    ]
  }
  ```

- Ensure the `evaluation_response` column in `public.documents` table is `JSONB` type. (This requires a SQL migration if it was previously `text`).
- Implement logic to identify and extract relevant metadata (e.g., parties, dates, subject, jurisdiction, document type) from the document content.
- Implement logic to generate a concise narrative summary of the agent's risk assessment, loophole findings, and strategic recommendations, including detailed strengths, weaknesses, and actionable update recommendations.

### Frontend Tasks

- Evaluation Results Page:

  - Risk Score (color-coded badge)
  - Loophole List
  - Strategic Recommendations (overall)
  - Display Extracted Document Metadata (e.g., in a dedicated section or card).
  - Display the Evaluation Summary generated by the agent.
  - Display **Weaknesses** (list of bullet points).
  - Display **Strengths** (list of bullet points).
  - Display **Recommendations for Update** (list of bullet points with actionable improvements).
  - Display **Strategies for Update** (list of bullet points with broader approaches).

---

## 4. Compliance Agent (New Agent)

### Goal

Validate legal document formatting and content compliance.

### Backend Tasks

- Implement endpoint: `/compliance/check`
- Input: document content
- Output:

  ```json
  {
    "formatting": "Pass",
    "required_clauses": ["Missing notarization section"],
    "jurisdiction_fit": "Good"
  }
  ```

- Rules can be statically coded or extracted using LLM + prompts for jurisdiction-specific formatting

### New Backend Tasks

- **New ComplianceCheckResults Schema**: Defined in `backend/app/models/schemas.py`.
- **Compliance Agent Service**: Implemented in `backend/app/services/ai_agent_compliance.py`, with a function `check_document_compliance` that takes document content, jurisdiction, and document type.
- **Document Model Update**: The `Document` schema in `backend/app/models/schemas.py` now includes an optional `compliance_check_results` field of type `ComplianceCheckResults`.
- **Integration into Document Endpoints**:
  - `POST /documents/create`: After generating a document, the compliance agent is triggered, and its results are saved to the `compliance_check_results` field of the newly created document.
  - `POST /documents/upload`: After evaluating an uploaded document, the compliance agent is triggered, and its results are saved to the `compliance_check_results` field of the uploaded document.
- **New Endpoint to Re-run Compliance Check**: `POST /documents/{document_id}/run-compliance` allows for a manual trigger of the compliance check on an existing document, updating its `compliance_check_results`.

### Database Schema Updates (SQL to run in Supabase)

```sql
ALTER TABLE public.documents
ADD COLUMN compliance_check_results JSONB;
```

### Frontend Tasks

- Document preview page:

  - Button: "Run Compliance Check"
  - Show pass/fail per section with suggestions

---

## 5. Dashboard Updates

### Goal

Improve usability and display logic.

### Backend Tasks

- Update `Document` model to include:

  - `created_at`
  - `updated_at`
  - `associated_profile`

### Frontend Tasks

- Recent Documents:

  - Sort by `created_at` descending
  - Group by client folder (if attorney)
  - Add filter by document type or area of law

---

## 6. Florida Template Integration

### Goal

Launch Florida-specific document templates for various legal areas.

### Backend Tasks

- Create templates tagged with `jurisdiction="Florida"`
- Ensure all templates follow Florida formatting standards
- Store templates per area of law:

  - Family Law: Divorce Petition, Custody Agreement
  - Civil Litigation: Complaint, Answer, Motion to Dismiss
  - Probate: Petition for Administration, Will Sample
  - Landlord-Tenant: Eviction Notice, Lease Termination
  - Business: Operating Agreement, Partnership Agreement
  - Legal Aid: Simplified Contracts
  - Pro Se: Pro Se Affidavit, Waivers

### Frontend Tasks

- Template selection page:

  - Allow filtering by State = Florida
  - Show visual badges like "Florida-Ready"

---
