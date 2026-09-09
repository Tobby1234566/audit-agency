-- Vercel Postgres Schema for AuditPulse

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audits table
CREATE TABLE IF NOT EXISTS audits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    url VARCHAR(500) NOT NULL,
    type VARCHAR(50) DEFAULT 'free', -- 'free', 'one_time', 'subscription'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'scanning', 'completed', 'failed'
    score INTEGER, -- 0-100
    findings_json JSONB,
    report_url VARCHAR(500),
    email VARCHAR(255), -- for free audits without account
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    audit_id INTEGER REFERENCES audits(id),
    amount INTEGER NOT NULL, -- in cents (e.g. 19900 = $199.00)
    currency VARCHAR(10) DEFAULT 'usd',
    stripe_payment_id VARCHAR(255),
    stripe_session_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'succeeded', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leads table (for email capture from free tool)
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    score INTEGER,
    source VARCHAR(100) DEFAULT 'free_audit',
    converted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audits_user_id ON audits(user_id);
CREATE INDEX IF NOT EXISTS idx_audits_url ON audits(url);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
