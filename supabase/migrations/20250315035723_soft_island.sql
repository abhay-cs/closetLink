/*
  # Add Closets and Improve Authentication

  1. New Tables
    - `closets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `closet_items`
      - `id` (uuid, primary key)
      - `closet_id` (uuid, references closets)
      - `clothing_item_id` (uuid, references clothing_items)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create closets table
CREATE TABLE IF NOT EXISTS closets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Create closet_items table for many-to-many relationship
CREATE TABLE IF NOT EXISTS closet_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    closet_id uuid REFERENCES closets ON DELETE CASCADE NOT NULL,
    clothing_item_id uuid REFERENCES clothing_items ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(closet_id, clothing_item_id)
);

-- Enable RLS
ALTER TABLE closets ENABLE ROW LEVEL SECURITY;
ALTER TABLE closet_items ENABLE ROW LEVEL SECURITY;

-- Policies for closets
CREATE POLICY "Users can manage their own closets"
    ON closets FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policies for closet items
CREATE POLICY "Users can manage items in their closets"
    ON closet_items FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM closets
            WHERE closets.id = closet_items.closet_id
            AND closets.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM closets
            WHERE closets.id = closet_items.closet_id
            AND closets.user_id = auth.uid()
        )
    );