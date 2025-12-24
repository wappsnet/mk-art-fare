-- Convert default_value from TEXT to JSON for proper type handling
-- This allows storing typed default values (string, number, boolean, array, object)
-- without stringification/parsing

ALTER TABLE field_definitions
  MODIFY COLUMN default_value JSON;
