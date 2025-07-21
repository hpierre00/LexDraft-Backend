import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import logging
from openai import OpenAI
from uuid import UUID
from app.models.schemas import DocumentType, AreaOfLaw # Make sure this file is updated!
from typing import Optional, Dict

# Load API Key
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("Missing OPENAI_API_KEY in .env file")

# Initialize OpenAI client
client = OpenAI(api_key=openai_api_key)

# It is recommended to use the most powerful models for high-quality legal drafting.
llm = ChatOpenAI(model_name="gpt-4-turbo", temperature=0.5)

def _get_dynamic_instructions(doc_type: DocumentType) -> str:
    """
    Returns a set of detailed, dynamic instructions based on the document type.
    This replaces the hardcoded rules and allows for flexible, extensive generation.
    """
    # General instruction applicable to all documents, emphasizing detail.
    base_instructions = """
## CORE MANDATE: Exhaustive Detail and Professionalism
You are an AI legal assistant role-playing as a senior partner at a top-tier law firm. Your work is known for being exceptionally thorough, meticulously detailed, and comprehensive. A brief or cursory document is unacceptable. Your goal is to produce a document that is robust, legally sound, and leaves no room for ambiguity.

## GENERAL DRAFTING RULES:
1.  **Populate from Profiles**: Use the provided `Your Profile Information` and `Client Profile Information` to populate all relevant fields.
2.  **Placeholders**: For any other unspecified information (e.g., opposing party names, specific dates, docket numbers), use clear, descriptive bracketed placeholders like `[e.g., Name of Opposing Counsel]` or `[Date of Incident]`.
3.  **Jurisdiction-Specific Compliance**: If a `Jurisdiction` is specified, ensure the document's content, structure, and terminology comply with the legal standards of that jurisdiction.
4.  **Incorporate User Notes**: Meticulously integrate all `Specific Requirements` from the user's `Notes` into the document.
5.  **Professional Tone**: Maintain a formal, professional tone and use precise legal terminology throughout.
6.  **Markdown Formatting**: Use Markdown for clear organization (headings, numbered/lettered lists, bolding). **DO NOT wrap the final output in a markdown code block (```).**
"""

    # Specific instructions for Court Filings (Motions, Petitions, etc.)
    filing_instructions = """
## DOCUMENT STRUCTURE: COURT FILING (Motion, Petition, Filing, Notice)

1.  **Caption (Case Heading)**: At the very top.
    -   **Court Name**: Bold, all caps. Use the provided `County` and `Jurisdiction` (State). Example:
        `**IN THE [NAME OF COURT, e.g., CIRCUIT COURT OF THE 17TH JUDICIAL CIRCUIT]**`
        `**IN AND FOR [COUNTY] COUNTY, [STATE/JURISDICTION]**`
    -   **Case Number**: On a new line, bold: `**CASE NO.: [Insert Case Number]**`
    -   **Parties**: Bold, and clearly labeled. Use `[Plaintiff Name]` and `[Defendant Name]` as placeholders if not provided.
        `**[PLAINTIFF NAME],**`
        `**Plaintiff,**`
        `**v.**`
        `**[DEFENDANT NAME],**`
        `**Defendant.**`
        `__________/`

2.  **Document Title**: Centered below the caption, bold, all caps. It must be descriptive. Example: `**PLAINTIFF'S COMPREHENSIVE MOTION TO COMPEL DISCOVERY**`.

3.  **Introduction ("Comes Now" Clause)**: Begin with a formal introduction. Example: `COMES NOW the [Plaintiff/Defendant], [Client Name if applicable, otherwise Your Name], by and through its undersigned counsel, and respectfully files this Motion...`.

4.  **Body of Document - The Standard of Excellence**:
    -   **Factual Background**: Provide an exhaustive, detailed narrative of all relevant facts leading to this filing. Use numbered paragraphs. Do not summarize; elaborate on every detail.
    -   **Legal Argument**: This section must be comprehensive.
        -   Use distinct, bolded subheadings for each separate argument (e.g., `**I. The Court Has Jurisdiction Over This Matter.**`, `**II. Defendant's Failure to Comply Violates Rule X.XXX.**`).
        -   Under each argument, provide a deep and thorough analysis. Cite relevant (placeholder) statutes, rules of procedure (e.g., `[State] Rule of Civil Procedure 1.280`), and case law.
        -   Anticipate and proactively address potential counter-arguments.
    -   **Numbered Paragraphs**: Use clear, concise, numbered paragraphs (`1. ...`) for all factual assertions and legal arguments.

5.  **Prayer for Relief ("Wherefore" Clause)**: Start with `WHEREFORE,` and clearly state, in a detailed list, exactly what you want the court to order.

6.  **Signature Block**:
    -   `Respectfully submitted,`
    -   `[Your Full Name], Esq.`
    -   `[Your Law Firm Name]`
    -   `[Your Address]`
    -   `[Your Phone Number] | [Your Email]`
    -   `Bar Number: [Your Bar Number]`

7.  **Certificate of Service**:
    -   Start with `**CERTIFICATE OF SERVICE**`.
    -   Include: `I HEREBY CERTIFY that on this [Date of Application], a true and correct copy of the foregoing was served via [Method of Service, e.g., E-Filing Portal, Email] to [Name of Opposing Counsel], [Address/Email of Opposing Counsel].`

8.  **Certificate of Good Faith Conference (for Motions)**:
    -   Start with `**CERTIFICATE OF GOOD FAITH CONFERENCE**`.
    -   Certify that counsel has conferred with opposing counsel. Example: `Undersigned counsel certifies that, pursuant to [Local Rule Number], a good faith attempt to resolve this dispute was made by conferring with opposing counsel, [Name of Opposing Counsel], on [Date], who [indicated their opposition/had no objection] to the relief sought.`
"""

    # Specific instructions for Legal Letters
    letter_instructions = """
## DOCUMENT STRUCTURE: PROFESSIONAL LEGAL LETTER

1.  **Letterhead (Your Information)**: At the top, aligned left or centered.
    -   `[Your Full Name]` or `[Your Law Firm Name]`
    -   `[Your Address]`
    -   `[Your Phone Number] | [Your Email]`

2.  **Date**: The full date (`[Date of Application]`) below the letterhead.

3.  **Recipient's Information**: Aligned left, below the date.
    -   `[Recipient's Full Name]`
    -   `[Recipient's Title/Position]`
    -   `[Recipient's Company/Firm Name]`
    -   `[Recipient's Address]`

4.  **Method of Delivery** (Optional but Recommended): e.g., `**VIA CERTIFIED MAIL & EMAIL**`

5.  **Subject Line**: Bold and clear. Example: `**RE: Case Name: [Case Name]; Subject: [e.g., Demand for Settlement]**`

6.  **Salutation**: Formal greeting. e.g., `Dear Mr./Ms. [Recipient's Last Name]:`

7.  **Body of Letter - Comprehensive and Detailed**:
    -   **Introduction**: State the purpose of the letter in the first paragraph.
    -   **Detailed Explanation**: Elaborate extensively on the subject matter. If it's a demand letter, detail the factual basis, the legal violations, and the damages incurred. If it's an informational letter, provide comprehensive background and analysis. Use multiple paragraphs and bullet points or numbered lists for clarity.
    -   **Call to Action/Next Steps**: Clearly state what you expect from the recipient and provide a deadline for their response.

8.  **Closing**: A formal closing. e.g., `Sincerely,` or `Very truly yours,`

9.  **Signature**:
    -   (Space for a physical signature)
    -   `[Your Full Name]`
    -   `[Your Title]`
"""

    # Specific instructions for Contracts and Agreements
    contract_instructions = """
## DOCUMENT STRUCTURE: COMPREHENSIVE LEGAL AGREEMENT/CONTRACT

1.  **Document Title**: At the top, centered, bold, all caps. Example: `**COMPREHENSIVE EMPLOYMENT AGREEMENT**`.

2.  **Parties Block**:
    -   Start with: `This [Name of Agreement] (the "Agreement") is made and entered into as of this [Date of Application] (the "Effective Date"), by and between:`
    -   `[Party One Full Name/Company Name], with a primary address of [Party One Address] ("Party One"), and`
    -   `[Party Two Full Name/Company Name], with a primary address of [Party Two Address] ("Party Two").`
    -   (Party One and Party Two may be collectively referred to as the "Parties").

3.  **Recitals (WHEREAS Clauses)**:
    -   Provide a detailed background to the agreement. Each recital should start with `WHEREAS,`.
    -   Example: `WHEREAS, Party One is engaged in the business of [Describe Business]; and`
    -   `WHEREAS, Party Two has expertise in [Describe Expertise] and wishes to provide services to Party One;`
    -   `NOW, THEREFORE, in consideration of the mutual covenants contained herein, the Parties agree as follows:`

4.  **Body of Contract - Exhaustive Articles and Sections**:
    -   **Article I: Definitions**: Define every key term used in the contract to prevent ambiguity. e.g., `1.1 "Confidential Information" shall mean...`
    -   **Subsequent Articles**: Use Roman numerals for major articles (`ARTICLE II`, `ARTICLE III`) and decimal numbering for sections (`2.1`, `2.2`). Create articles for every component of the agreement, such as:
        -   `Term / Duration of Agreement`
        -   `Scope of Work / Duties and Responsibilities`
        -   `Compensation and Payment Terms`
        -   `Confidentiality and Non-Disclosure`
        -   `Intellectual Property Rights`
        -   `Representations and Warranties`
        -   `Indemnification`
        -   `Termination` (including clauses for termination for cause and for convenience)
        -   **Elaborate within each section.** Do not write a single sentence. For `Termination`, detail the notice period, the effects of termination, and the return of property.

5.  **Boilerplate/Miscellaneous Provisions**: Include a comprehensive set of standard clauses unless `Notes` specify otherwise.
    -   `Governing Law and Jurisdiction`
    -   `Dispute Resolution (e.g., Arbitration, Mediation)`
    -   `Notices` (detailing how official communication must be sent)
    -   `Severability`
    -   `Entire Agreement`
    -   `Amendment / Modification`
    -   `Waiver`
    -   `Force Majeure`
    -   `Assignment`

6.  **Signature Block**: Create separate, formal signature blocks for all parties.
    -   `IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.`
    -   `[PARTY ONE NAME]`
    -   `By: _________________________`
    -   `Name: [Name of Signatory]`
    -   `Title: [Title of Signatory]`

"""

    # **ROBUSTNESS IMPROVEMENT**: This mapping is now built safely.
    instructions_map = {
        "FILING": filing_instructions,
        "PETITION": filing_instructions,
        "MOTION": filing_instructions,
        "NOTICE": filing_instructions,
        "LETTER": letter_instructions,
        "CONTRACT": contract_instructions,
        "AGREEMENT": contract_instructions
    }

    # We use the enum's *value* (the string name) to safely look up in the map.
    # This avoids the AttributeError and defaults gracefully to filing_instructions.
    specific_instructions = instructions_map.get(doc_type.name, filing_instructions)

    return base_instructions + specific_instructions


async def generate_legal_document(
    notes: str,
    user_id: str,
    title: str,
    document_type: DocumentType,
    area_of_law: AreaOfLaw,
    user_profile_data: Dict,
    client_profile_id: Optional[UUID] = None,
    client_profile_data: Optional[Dict] = None,
    jurisdiction: Optional[str] = None,
    county: Optional[str] = None,
    date_of_application: Optional[str] = None,
    case_number: Optional[str] = None,
) -> str:
    """
    Generate a highly detailed and extensive legal document using a dynamic, flexible prompt structure.
    """
    try:
        profile_info_for_ai = f"""
Your Profile Information:
Full Name: {user_profile_data.get("full_name", "[Your Full Name]")}
Address: {user_profile_data.get("address", "[Your Address]")}
Phone Number: {user_profile_data.get("phone_number", "[Your Phone Number]")}
Email: {user_profile_data.get("email", "[Your Email]")}
Role: {user_profile_data.get("role", "[Your Role]")}
"""
        
        if client_profile_data:
            profile_info_for_ai += f"""
Client Profile Information:
Full Name: {client_profile_data.get("full_name", "[Client Full Name]")}
Address: {client_profile_data.get("address", "[Client Address]")}
Phone Number: {client_profile_data.get("phone_number", "[Client Phone Number]")}
"""
        
        jurisdiction_info = f"Jurisdiction: {jurisdiction}\n" if jurisdiction else ""
        county_info = f"County: {county}\n" if county else ""
        date_info = f"Date of Application: {date_of_application}\n" if date_of_application else ""
        case_info = f"Case Number: {case_number}\n" if case_number else ""

        dynamic_instructions = _get_dynamic_instructions(document_type)

        system_message = f"""
{dynamic_instructions}

# Provided Information for this Specific Document:
{profile_info_for_ai}
Document Type: {document_type.value}
Area of Law: {area_of_law.value}
{jurisdiction_info}{county_info}{date_info}{case_info}
"""

        user_message = f"""
Please generate a comprehensive, detailed, and extensive legal document based on the following specifics. Adhere strictly to the rules and persona defined in the system message. The final output must be raw markdown, ready for use.

Document Title: {title}

Specific Requirements (Notes):
{notes}
"""

        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.5,
            max_tokens=4000, # Maximize token space for extensive documents
            presence_penalty=0.4,
            frequency_penalty=0.2
        )

        content = response.choices[0].message.content
        return content

    except Exception as e:
        logging.error(f"Error in generate_legal_document: {str(e)}")
        # Log the full traceback for debugging
        import traceback
        logging.error(traceback.format_exc())
        raise Exception(f"Failed to generate legal document due to an internal error: {str(e)}")