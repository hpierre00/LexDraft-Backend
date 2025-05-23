import os
from supabase import create_client
from docx import Document
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY environment variable is required")

# Initialize Supabase client with service role key
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

STATES_DIR = os.path.join(os.path.dirname(__file__), "..", "documents", "states")
BUCKET = "legal-templates"

# State name corrections
STATE_CORRECTIONS = {
    "llinois": "Illinois",
    "lowa": "Iowa",
    "missoui": "Missouri",
    "okalhoma": "Oklahoma",
    "vermont": "Vermont",
    "virginia": "Virginia",
    "washington": "Washington",
    "westvirginia": "West Virginia",
    "districtofcolumbia": "District of Columbia",
    "newhampshire": "New Hampshire",
    "newjersey": "New Jersey",
    "newmexico": "New Mexico",
    "newyork": "New York",
    "northcarolina": "North Carolina",
    "northdakota": "North Dakota",
    "rhodeisland": "Rhode Island",
    "southcarolina": "South Carolina",
    "southdakota": "South Dakota"
}

def normalize_name(name):
    return name.lower().replace(" ", "").replace("_", "").replace("-", "")

def get_state_folder_map():
    # Use service role key to bypass RLS
    resp = supabase.from_("states").select("state_id,state_name").execute()
    mapping = {}
    for s in resp.data:
        folder_key = normalize_name(s["state_name"])
        mapping[folder_key] = {"state_id": s["state_id"], "state_name": s["state_name"]}
    return mapping

def get_state_id(state_name):
    # Use service role key to bypass RLS
    resp = supabase.from_("states").select("state_id").ilike("state_name", state_name).execute()
    if resp.data:
        return resp.data[0]["state_id"]
    return None

def get_document_type_id(doc_type_name):
    # Clean up the document type name
    doc_type_name = doc_type_name.replace("-", " ").replace("_", " ")
    
    # Remove state prefix if it exists
    for state in STATE_CORRECTIONS.values():
        if doc_type_name.lower().startswith(state.lower()):
            doc_type_name = doc_type_name[len(state):].strip()
    
    # Try exact match first
    resp = supabase.from_("document_types").select("document_type_id").ilike("document_type_name", doc_type_name).execute()
    if resp.data:
        return resp.data[0]["document_type_id"]
    
    # Try with common variations
    variations = [
        doc_type_name,
        doc_type_name.replace(" Agreement", ""),
        doc_type_name.replace(" Form", ""),
        doc_type_name.replace(" Template", ""),
        doc_type_name.replace(" Contract", ""),
        doc_type_name.replace(" Standard", ""),
        doc_type_name.replace(" Single Member", ""),
        doc_type_name.replace(" LLC", ""),
        doc_type_name.replace(" Operating", ""),
        doc_type_name.replace(" Month to Month", ""),
        doc_type_name.replace(" Lease to Own", ""),
        doc_type_name.replace(" Option to Purchase", ""),
        doc_type_name.replace(" General Warranty", ""),
        doc_type_name.replace(" Non Disclosure", "Non Disclosure"),
        doc_type_name.replace(" Residential", ""),
        doc_type_name.replace(" Commercial", ""),
        doc_type_name.replace(" Domestic", ""),
        doc_type_name.replace(" Partnership", ""),
        doc_type_name.replace(" Settlement", ""),
        doc_type_name.replace(" Purchase", ""),
        doc_type_name.replace(" Roommate", ""),
        doc_type_name.replace(" Sublease", ""),
        doc_type_name.replace(" Prenuptial", ""),
        doc_type_name.replace(" Marital", ""),
        doc_type_name.replace(" Assignment of", ""),
        doc_type_name.replace(" Insurance Proceeds", ""),
        doc_type_name.replace(" Mortgage", ""),
        doc_type_name.replace(" Pre Approval", "Pre Approval"),
        doc_type_name.replace(" Employment Contract", "Employment Contract")
    ]
    
    for variation in variations:
        resp = supabase.from_("document_types").select("document_type_id").ilike("document_type_name", variation).execute()
        if resp.data:
            return resp.data[0]["document_type_id"]
    
    return None

def extract_docx_content(file_path):
    try:
        doc = Document(file_path)
        content = []
        for para in doc.paragraphs:
            if para.text.strip():  # Skip empty paragraphs
                content.append(para.text)
        return "\n".join(content)
    except Exception as e:
        print(f"Error extracting content from {file_path}: {str(e)}")
        return None

def ensure_bucket_exists():
    try:
        # Try to list buckets to check if it exists
        buckets = supabase.storage.list_buckets()
        bucket_exists = any(bucket.name == BUCKET for bucket in buckets)
        
        if not bucket_exists:
            # Create the bucket if it doesn't exist
            supabase.storage.create_bucket(BUCKET)
            print(f"Created bucket: {BUCKET}")
    except Exception as e:
        print(f"Error ensuring bucket exists: {e}")
        # Try to create bucket directly
        try:
            supabase.storage.create_bucket(BUCKET)
            print(f"Created bucket: {BUCKET}")
        except Exception as e2:
            print(f"Failed to create bucket: {e2}")
            print("Please create the bucket manually in the Supabase dashboard:")
            print("1. Go to Storage in your Supabase dashboard")
            print("2. Create a new bucket named 'legal-templates'")
            print("3. Set it as private")
            raise

def main():
    ensure_bucket_exists()
    
    state_map = get_state_folder_map()
    print("State mapping keys from Supabase:", list(state_map.keys()))
    
    for state_folder in os.listdir(STATES_DIR):
        state_path = os.path.join(STATES_DIR, state_folder)
        if not os.path.isdir(state_path):
            continue
            
        # Correct state name if needed
        corrected_state = STATE_CORRECTIONS.get(state_folder, state_folder)
        folder_key = normalize_name(corrected_state)
        print(f"Processing folder '{state_folder}' as key '{folder_key}'")
        
        state_info = state_map.get(folder_key)
        if not state_info:
            print(f"Skipping unknown state: {state_folder}")
            continue
            
        state_id = state_info["state_id"]
        state_name = state_info["state_name"]
        
        for file in os.listdir(state_path):
            if not file.lower().endswith(".docx"):
                continue
                
            # Clean up document type name
            doc_type_name = os.path.splitext(file)[0]
            doc_type_name = doc_type_name.replace("-", " ").replace("_", " ")
            # Remove state prefix if it exists
            if doc_type_name.lower().startswith(state_name.lower()):
                doc_type_name = doc_type_name[len(state_name):].strip()
            doc_type_name = doc_type_name.title()
            
            doc_type_id = get_document_type_id(doc_type_name)
            if not doc_type_id:
                print(f"Skipping unknown doc type: {doc_type_name}")
                continue
                
            file_path = os.path.join(state_path, file)
            storage_path = f"{state_name}/{doc_type_name}/{file}"
            
            try:
                # Extract content from docx
                content = extract_docx_content(file_path)
                if not content:
                    print(f"Skipping {file} due to content extraction error")
                    continue

                with open(file_path, "rb") as f:
                    # First try to remove if exists
                    try:
                        supabase.storage.from_(BUCKET).remove([storage_path])
                    except:
                        pass
                    
                    # Then upload
                    try:
                        upload_resp = supabase.storage.from_(BUCKET).upload(storage_path, f.read())
                        print(f"Uploaded: {storage_path}")
                    except Exception as upload_error:
                        print(f"Upload failed: {str(upload_error)}")
                        continue
                        
                try:
                    # Use service role key to bypass RLS
                    insert_resp = supabase.from_("templates").insert({
                        "state_id": state_id,
                        "document_type_id": doc_type_id,
                        "template_name": file,
                        "file_path": storage_path,
                        "content": content,
                        "uploaded_by": "00000000-0000-0000-0000-000000000000"  # System user ID for bulk uploads
                    }).execute()
                    print(f"Registered in database: {storage_path}")
                except Exception as db_error:
                    print(f"DB insert failed: {str(db_error)}")
                    if hasattr(db_error, 'json'):
                        print(f"Error details: {db_error.json()}")
                    
            except Exception as e:
                print(f"Error processing {file}: {str(e)}")

if __name__ == "__main__":
    main()
