/*
  # Wardrobe Builder Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
    - `clothing_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `category_id` (uuid, references categories)
      - `name` (text)
      - `url` (text)
      - `image_url` (text)
      - `price` (numeric)
      - `description` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create categories table
CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Create clothing items table
CREATE TABLE clothing_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    category_id uuid REFERENCES categories NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    image_url text,
    price numeric,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;

-- Policies for categories (viewable by all authenticated users)
CREATE POLICY "Categories are viewable by all authenticated users"
    ON categories FOR SELECT
    TO authenticated
    USING (true);

-- Policies for clothing items
CREATE POLICY "Users can manage their own clothing items"
    ON clothing_items FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Insert default categories
INSERT INTO categories (name) VALUES
    ('Tops'),
    ('Bottoms'),
    ('Dresses'),
    ('Outerwear'),
    ('Shoes'),
    ('Accessories')
ON CONFLICT (name) DO NOTHING;