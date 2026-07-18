-- Supabase eCommerce Database Schema & Row-Level Security (RLS) Setup
-- This script should be executed in the Supabase SQL Editor.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. Create Tables
--------------------------------------------------------------------------------

-- profiles table (automatically synced via trigger from auth.users)
create table if nulls distinct public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- addresses table
create table if not exists public.addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  street_address text not null,
  city text not null,
  state text,
  postal_code text,
  country text not null default 'Nepal',
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- wishlist table
create table if not exists public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id)
);

-- cart table
create table if not exists public.cart (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id text not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id)
);

-- orders table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  total_amount numeric not null check (total_amount >= 0),
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Packaging', 'Out for Delivery', 'Delivered', 'Cancelled')),
  shipping_address text not null,
  payment_method text not null,
  payment_status text not null default 'Pending' check (payment_status in ('Pending', 'Verified', 'Failed', 'Refunded')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- order_items table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id text not null,
  product_name text not null,
  price numeric not null check (price >= 0),
  quantity integer not null default 1 check (quantity > 0)
);

-- reviews table
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  approved boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- coupons table
create table if not exists public.coupons (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  discount_percent integer not null check (discount_percent between 1 and 100),
  active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- notifications table
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

--------------------------------------------------------------------------------
-- 2. Setup Row Level Security (RLS) on all tables
--------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlist enable row level security;
alter table public.cart enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.notifications enable row level security;

--------------------------------------------------------------------------------
-- 3. Define RLS Policies
--------------------------------------------------------------------------------

-- PROFILES Policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- ADDRESSES Policies
create policy "Users can manage their own addresses" on public.addresses
  for all using (auth.uid() = user_id);

-- WISHLIST Policies
create policy "Users can manage their own wishlist items" on public.wishlist
  for all using (auth.uid() = user_id);

-- CART Policies
create policy "Users can manage their own cart" on public.cart
  for all using (auth.uid() = user_id);

-- ORDERS Policies
create policy "Users can read their own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Users can create their own orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- ORDER ITEMS Policies
-- Users can see order items of their own orders
create policy "Users can see items of their own orders" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where public.orders.id = public.order_items.order_id
      and public.orders.user_id = auth.uid()
    )
  );

create policy "Users can create items for their own orders" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where public.orders.id = public.order_items.order_id
      and public.orders.user_id = auth.uid()
    )
  );

-- REVIEWS Policies
create policy "Anyone can read reviews" on public.reviews
  for select using (true);

create policy "Authenticated users can create reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update/delete their own reviews" on public.reviews
  for all using (auth.uid() = user_id);

-- COUPONS Policies
create policy "Anyone can view active coupons" on public.coupons
  for select using (active = true);

-- NOTIFICATIONS Policies
create policy "Users can view and manage their own notifications" on public.notifications
  for all using (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- 4. Automatic profile creation Trigger (Triggers on new signup in Auth)
--------------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger definition
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
