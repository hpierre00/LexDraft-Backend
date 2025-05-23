import os
import uuid
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def seed_states():
    states = [
        {"state_id": str(uuid.uuid4()), "state_name": "Alabama"},
        {"state_id": str(uuid.uuid4()), "state_name": "Alaska"},
        {"state_id": str(uuid.uuid4()), "state_name": "Arizona"},
        {"state_id": str(uuid.uuid4()), "state_name": "Arkansas"},
        {"state_id": str(uuid.uuid4()), "state_name": "California"},
        {"state_id": str(uuid.uuid4()), "state_name": "Colorado"},
        {"state_id": str(uuid.uuid4()), "state_name": "Connecticut"},
        {"state_id": str(uuid.uuid4()), "state_name": "Delaware"},
        {"state_id": str(uuid.uuid4()), "state_name": "District of Columbia"},
        {"state_id": str(uuid.uuid4()), "state_name": "Florida"},
        {"state_id": str(uuid.uuid4()), "state_name": "Georgia"},
        {"state_id": str(uuid.uuid4()), "state_name": "Hawaii"},
        {"state_id": str(uuid.uuid4()), "state_name": "Idaho"},
        {"state_id": str(uuid.uuid4()), "state_name": "Illinois"},
        {"state_id": str(uuid.uuid4()), "state_name": "Indiana"},
        {"state_id": str(uuid.uuid4()), "state_name": "Iowa"},
        {"state_id": str(uuid.uuid4()), "state_name": "Kansas"},
        {"state_id": str(uuid.uuid4()), "state_name": "Kentucky"},
        {"state_id": str(uuid.uuid4()), "state_name": "Louisiana"},
        {"state_id": str(uuid.uuid4()), "state_name": "Maine"},
        {"state_id": str(uuid.uuid4()), "state_name": "Maryland"},
        {"state_id": str(uuid.uuid4()), "state_name": "Massachusetts"},
        {"state_id": str(uuid.uuid4()), "state_name": "Michigan"},
        {"state_id": str(uuid.uuid4()), "state_name": "Minnesota"},
        {"state_id": str(uuid.uuid4()), "state_name": "Mississippi"},
        {"state_id": str(uuid.uuid4()), "state_name": "Missouri"},
        {"state_id": str(uuid.uuid4()), "state_name": "Montana"},
        {"state_id": str(uuid.uuid4()), "state_name": "Nebraska"},
        {"state_id": str(uuid.uuid4()), "state_name": "Nevada"},
        {"state_id": str(uuid.uuid4()), "state_name": "New Hampshire"},
        {"state_id": str(uuid.uuid4()), "state_name": "New Jersey"},
        {"state_id": str(uuid.uuid4()), "state_name": "New Mexico"},
        {"state_id": str(uuid.uuid4()), "state_name": "New York"},
        {"state_id": str(uuid.uuid4()), "state_name": "North Carolina"},
        {"state_id": str(uuid.uuid4()), "state_name": "North Dakota"},
        {"state_id": str(uuid.uuid4()), "state_name": "Ohio"},
        {"state_id": str(uuid.uuid4()), "state_name": "Oklahoma"},
        {"state_id": str(uuid.uuid4()), "state_name": "Oregon"},
        {"state_id": str(uuid.uuid4()), "state_name": "Pennsylvania"},
        {"state_id": str(uuid.uuid4()), "state_name": "Rhode Island"},
        {"state_id": str(uuid.uuid4()), "state_name": "South Carolina"},
        {"state_id": str(uuid.uuid4()), "state_name": "South Dakota"},
        {"state_id": str(uuid.uuid4()), "state_name": "Tennessee"},
        {"state_id": str(uuid.uuid4()), "state_name": "Texas"},
        {"state_id": str(uuid.uuid4()), "state_name": "Utah"},
        {"state_id": str(uuid.uuid4()), "state_name": "Vermont"},
        {"state_id": str(uuid.uuid4()), "state_name": "Virginia"},
        {"state_id": str(uuid.uuid4()), "state_name": "Washington"},
        {"state_id": str(uuid.uuid4()), "state_name": "West Virginia"},
        {"state_id": str(uuid.uuid4()), "state_name": "Wisconsin"},
        {"state_id": str(uuid.uuid4()), "state_name": "Wyoming"}
    ]
    
    state_map = {}  # To store state_name -> state_id mapping
    
    # First, get existing states
    try:
        existing_states = supabase.from_("states").select("state_id,state_name").execute()
        for state in existing_states.data:
            state_map[state["state_name"]] = state["state_id"]
    except Exception as e:
        print(f"Error fetching existing states: {e}")
    
    # Then insert new states
    for state in states:
        if state["state_name"] in state_map:
            print(f"State already exists: {state['state_name']}")
            continue
            
        try:
            resp = supabase.from_("states").insert(state).execute()
            state_map[state["state_name"]] = state["state_id"]
            print(f"Inserted state: {state['state_name']}")
        except Exception as e:
            print(f"Error inserting state {state['state_name']}: {e}")
    
    return state_map

def seed_document_types(state_map):
    # Get Alabama's state_id since we're using its documents as reference
    alabama_id = state_map.get("Alabama")
    if not alabama_id:
        print("Error: Could not find Alabama state_id")
        return

    # First, get existing document types
    try:
        existing_docs = supabase.from_("document_types").select("document_type_id,document_type_name").execute()
        existing_doc_names = {doc["document_type_name"] for doc in existing_docs.data}
    except Exception as e:
        print(f"Error fetching existing document types: {e}")
        existing_doc_names = set()

    doc_types = [
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Pre Approval Letter"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Employment Contract Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Assignment of Mortgage"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Assignment of Insurance Proceeds"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Sublease Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Standard Residential Lease Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Single Member LLC Operating Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Roommate Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Prenuptial Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Residential Purchase Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Partnership Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Non Disclosure Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "LLC Operating Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Marital Settlement Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Month to Month Lease Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Lease to Own Option to Purchase Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "General Warranty Deed Form"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Employment Contract"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Commercial Lease Agreement"},
        {"document_type_id": str(uuid.uuid4()), "state_id": alabama_id, "document_type_name": "Affidavit of Domestic Partnership"}
    ]
    
    for doc_type in doc_types:
        if doc_type["document_type_name"] in existing_doc_names:
            print(f"Document type already exists: {doc_type['document_type_name']}")
            continue
            
        try:
            resp = supabase.from_("document_types").insert(doc_type).execute()
            print(f"Inserted document type: {doc_type['document_type_name']}")
        except Exception as e:
            print(f"Error inserting document type {doc_type['document_type_name']}: {e}")

def main():
    print("Seeding states...")
    state_map = seed_states()
    print("\nSeeding document types...")
    seed_document_types(state_map)
    print("\nDatabase seeding completed!")

if __name__ == "__main__":
    main() 