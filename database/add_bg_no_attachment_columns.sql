-- Add BG NO attachment columns to epbg table
ALTER TABLE epbg 
ADD COLUMN bg_no_attachment_name VARCHAR(255) AFTER file_type;

ALTER TABLE epbg 
ADD COLUMN bg_no_attachment_base64 LONGTEXT AFTER bg_no_attachment_name;

ALTER TABLE epbg 
ADD COLUMN bg_no_attachment_type VARCHAR(100) AFTER bg_no_attachment_base64;
