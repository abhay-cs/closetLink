/*
  # Update Categories Access Policy

  1. Changes
    - Drop existing policy
    - Add new policy to allow public read access to categories
    - Categories should be viewable by everyone, not just authenticated users
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Categories are viewable by all authenticated users" ON categories;

-- Create new policy for public read access
CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    TO public
    USING (true);