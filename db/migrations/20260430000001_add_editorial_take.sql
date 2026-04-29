-- nullable so existing rows continue to work
ALTER TABLE stories ADD COLUMN editorial_take TEXT NULL;
