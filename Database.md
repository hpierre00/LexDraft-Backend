create table public.chat_histories (
  id uuid not null default extensions.uuid_generate_v4 (),
  session_id text not null,
  user_id uuid not null,
  history jsonb not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  title character varying(255) null default 'New Chat'::character varying,
  constraint chat_histories_pkey primary key (id),
  constraint chat_histories_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create unique INDEX IF not exists chat_histories_session_id_user_id_idx on public.chat_histories using btree (session_id, user_id) TABLESPACE pg_default;

create trigger on_chat_histories_updated_at BEFORE
update on chat_histories for EACH row
execute FUNCTION handle_chat_histories_updated_at ();




create table public.client_folders (
  id uuid not null default gen_random_uuid (),
  attorney_id uuid not null,
  client_profile_id uuid not null,
  folder_name text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint client_folders_pkey primary key (id),
  constraint client_folders_attorney_id_fkey foreign KEY (attorney_id) references profiles (id) on delete CASCADE,
  constraint client_folders_client_profile_id_fkey foreign KEY (client_profile_id) references client_profiles (id) on delete CASCADE
) TABLESPACE pg_default;



create table public.client_profiles (
  id uuid not null default gen_random_uuid (),
  attorney_id uuid not null,
  full_name text not null,
  address text null,
  phone_number text null,
  gender text null,
  date_of_birth date null,
  state text null,
  city text null,
  zip_code text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint client_profiles_pkey primary key (id),
  constraint client_profiles_attorney_id_fkey foreign KEY (attorney_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;



create table public.contacts (
  id serial not null,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone null default now(),
  constraint contacts_pkey primary key (id)
) TABLESPACE pg_default;


create table public.document_templates (
  id uuid not null default gen_random_uuid (),
  title text not null,
  document_type public.document_type not null,
  area_of_law public.area_of_law not null,
  jurisdiction text not null,
  template_text text not null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint document_templates_pkey primary key (id)
) TABLESPACE pg_default;


create table public.document_types (
  document_type_id uuid not null,
  state_id uuid null,
  document_type_name text not null,
  description text null,
  constraint document_types_pkey primary key (document_type_id),
  constraint document_types_state_id_fkey foreign KEY (state_id) references states (state_id)
) TABLESPACE pg_default;




create table public.documents (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  title text not null,
  content text null,
  status text null default 'active'::text,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  evaluation_response jsonb null,
  client_profile_id uuid null,
  compliance_check_results jsonb null,
  constraint documents_pkey primary key (id),
  constraint documents_client_profile_id_fkey foreign KEY (client_profile_id) references client_profiles (id) on delete set null,
  constraint documents_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;



create table public.profiles (
  id uuid not null,
  email text not null,
  first_name text null,
  last_name text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  full_name text null,
  address text null,
  phone_number text null,
  gender text null,
  date_of_birth date null,
  state text null,
  city text null,
  zip_code text null,
  role text not null,
  user_id uuid not null,
  is_admin boolean null default false,
  profile_setup_complete boolean null default false,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id),
  constraint profiles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger handle_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION handle_updated_at ();




create table public.research_history (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  title character varying(255) not null,
  query text not null,
  preliminary_result text null,
  clarifying_questions jsonb null,
  clarifying_answers jsonb null,
  final_result text null,
  status character varying(50) not null default 'preliminary'::character varying,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint research_history_pkey primary key (id),
  constraint research_history_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint research_history_status_check check (
    (
      (status)::text = any (
        (
          array[
            'preliminary'::character varying,
            'questions_pending'::character varying,
            'completed'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_research_history_user_id on public.research_history using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_research_history_created_at on public.research_history using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_research_history_status on public.research_history using btree (status) TABLESPACE pg_default;

create trigger trigger_research_history_updated_at BEFORE
update on research_history for EACH row
execute FUNCTION update_research_history_updated_at ();




create table public.states (
  state_id uuid not null,
  state_name text not null,
  constraint states_pkey primary key (state_id),
  constraint states_state_name_key unique (state_name)
) TABLESPACE pg_default;



create table public.support_tickets (
  id serial not null,
  user_id uuid null,
  type text null,
  subject text null,
  description text null,
  created_at timestamp with time zone null default now(),
  status text null default 'open'::text,
  attachment_filename text null,
  attachment_content text null,
  constraint support_tickets_pkey primary key (id),
  constraint support_tickets_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;



create table public.templates (
  id uuid not null default gen_random_uuid (),
  state_id uuid null,
  document_type_id uuid null,
  template_name text not null,
  file_path text not null,
  content text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint templates_pkey primary key (id),
  constraint templates_document_type_id_fkey foreign KEY (document_type_id) references document_types (document_type_id),
  constraint templates_state_id_fkey foreign KEY (state_id) references states (state_id)
) TABLESPACE pg_default;