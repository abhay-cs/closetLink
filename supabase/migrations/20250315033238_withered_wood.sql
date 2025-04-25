/*
  # Add default categories

  1. Changes
    - Insert default categories if they don't exist
*/

INSERT INTO categories (name) VALUES
    ('Tops'),
    ('Bottoms'),
    ('Dresses'),
    ('Outerwear'),
    ('Shoes'),
    ('Accessories')
ON CONFLICT (name) DO NOTHING;