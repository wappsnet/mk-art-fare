-- Migration: Update default_value column to JSON type and clean existing data
-- Description: Delete existing field data and change default_value from TEXT to JSON

-- Delete all existing field definitions and their values
DELETE FROM product_field_values;
DELETE FROM product_field_group_assignments;
DELETE FROM field_definitions;
DELETE FROM field_groups;

-- Change default_value column to JSON type
ALTER TABLE field_definitions
MODIFY COLUMN default_value JSON COMMENT 'Default value for the field (supports text, numbers, arrays, objects)';
