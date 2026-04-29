-- ============================================================
-- NP Create — Initial Schema
-- ============================================================

-- Helper: auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;


-- ============================================================
-- TABLE: portfolios
-- ============================================================
create table if not exists public.portfolios (
  id                uuid        primary key default gen_random_uuid(),
  title             text        not null,
  slug              text        not null unique,
  client_name       text,
  client_logo       text,
  industry          text,
  service_type      text[]      not null default '{}',
  short_desc        text,
  challenge         text,
  strategy          text,
  result            text,
  gmv_before        numeric,
  gmv_after         numeric,
  gmv_growth_pct    numeric,
  roas              numeric,
  ad_spend          numeric,
  duration_days     int,
  cover_image       text,
  is_featured       boolean     not null default false,
  is_published      boolean     not null default false,
  display_order     int         not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger portfolios_updated_at
  before update on public.portfolios
  for each row execute function public.handle_updated_at();

alter table public.portfolios enable row level security;

create policy "anon_can_read_published_portfolios"
  on public.portfolios for select to anon
  using (is_published = true);

create policy "authenticated_full_access_portfolios"
  on public.portfolios for all to authenticated
  using (true) with check (true);


-- ============================================================
-- TABLE: portfolio_media
-- ============================================================
create table if not exists public.portfolio_media (
  id              uuid        primary key default gen_random_uuid(),
  portfolio_id    uuid        not null references public.portfolios(id) on delete cascade,
  media_type      text        not null check (media_type in ('image','video','tiktok_embed','youtube_embed')),
  url             text,
  thumbnail_url   text,
  embed_code      text,
  caption         text,
  display_order   int         not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.portfolio_media enable row level security;

create policy "anon_can_read_portfolio_media"
  on public.portfolio_media for select to anon
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = portfolio_id and p.is_published = true
    )
  );

create policy "authenticated_full_access_portfolio_media"
  on public.portfolio_media for all to authenticated
  using (true) with check (true);


-- ============================================================
-- TABLE: services
-- ============================================================
create table if not exists public.services (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null,
  slug            text        not null unique,
  short_desc      text,
  full_desc       text,
  icon            text,
  features        jsonb       not null default '[]',
  starting_price  text,
  is_popular      boolean     not null default false,
  is_active       boolean     not null default true,
  display_order   int         not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger services_updated_at
  before update on public.services
  for each row execute function public.handle_updated_at();

alter table public.services enable row level security;

create policy "anon_can_read_active_services"
  on public.services for select to anon
  using (is_active = true);

create policy "authenticated_full_access_services"
  on public.services for all to authenticated
  using (true) with check (true);


-- ============================================================
-- TABLE: testimonials
-- ============================================================
create table if not exists public.testimonials (
  id                    uuid        primary key default gen_random_uuid(),
  client_name           text        not null,
  client_role           text,
  client_company        text,
  client_avatar         text,
  content               text        not null,
  short_quote           text,
  rating                int         check (rating between 1 and 5),
  related_portfolio_id  uuid        references public.portfolios(id) on delete set null,
  is_featured           boolean     not null default false,
  display_order         int         not null default 0,
  created_at            timestamptz not null default now()
);

alter table public.testimonials enable row level security;

create policy "anon_can_read_testimonials"
  on public.testimonials for select to anon
  using (true);

create policy "authenticated_full_access_testimonials"
  on public.testimonials for all to authenticated
  using (true) with check (true);


-- ============================================================
-- TABLE: client_logos
-- ============================================================
create table if not exists public.client_logos (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  logo_url      text        not null,
  website_url   text,
  display_order int         not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.client_logos enable row level security;

create policy "anon_can_read_client_logos"
  on public.client_logos for select to anon
  using (true);

create policy "authenticated_full_access_client_logos"
  on public.client_logos for all to authenticated
  using (true) with check (true);


-- ============================================================
-- TABLE: leads
-- ============================================================
create table if not exists public.leads (
  id              uuid        primary key default gen_random_uuid(),
  line_user_id    text        not null,
  display_name    text        not null,
  picture_url     text        not null default '',
  name            text        not null,
  phone           text        not null,
  brand           text        not null,
  monthly_gmv     text        not null,
  service         text        not null,
  message         text,
  status          text        not null default 'new'
                              check (status in ('new','contacted','closed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.handle_updated_at();

alter table public.leads enable row level security;

-- anon insert สำหรับ contact form (server-side API route)
create policy "anon_can_insert_leads"
  on public.leads for insert to anon
  with check (true);

-- authenticated (admin) อ่านและแก้ไขได้ทั้งหมด
create policy "authenticated_full_access_leads"
  on public.leads for all to authenticated
  using (true) with check (true);
