-- Create ai_analyses table if it doesn't exist
USE cmrl_dashboard;

CREATE TABLE IF NOT EXISTS ai_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT,
    analysis_type ENUM('risk', 'compliance', 'negotiation', 'renewal_suggestion'),
    ai_response TEXT,
    confidence_score DECIMAL(3,2),
    local_data_used BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- Show table structure
DESCRIBE ai_analyses;
