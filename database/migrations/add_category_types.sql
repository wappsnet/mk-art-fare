-- Add category type and organization_id to support both global and shop-specific categories

ALTER TABLE categories
ADD COLUMN organization_id INT NULL AFTER parent_id,
ADD COLUMN is_global BOOLEAN DEFAULT FALSE AFTER organization_id,
ADD FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Create index for organization_id
CREATE INDEX idx_organization_id ON categories(organization_id);
CREATE INDEX idx_is_global ON categories(is_global);

-- Insert some predefined global categories
INSERT INTO categories (name, slug, description, is_global) VALUES
('Paintings', 'paintings', 'Original paintings and canvas art', TRUE),
('Sculptures', 'sculptures', '3D art and sculptures', TRUE),
('Photography', 'photography', 'Fine art photography', TRUE),
('Digital Art', 'digital-art', 'Digital artwork and prints', TRUE),
('Drawings', 'drawings', 'Sketches, illustrations and drawings', TRUE),
('Mixed Media', 'mixed-media', 'Mixed media artworks', TRUE),
('Prints', 'prints', 'Art prints and reproductions', TRUE),
('Textiles', 'textiles', 'Fiber art and textiles', TRUE),
('Jewelry', 'jewelry', 'Handcrafted jewelry and accessories', TRUE),
('Ceramics', 'ceramics', 'Pottery and ceramic art', TRUE);
