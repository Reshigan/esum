-- ESUM Digital Contracts System Migration
-- Migration Date: 2026-03-27
-- Description: Add comprehensive digital contract management with electronic signatures

-- ============================================================================
-- UPDATE EXISTING CONTRACTS TABLE
-- ============================================================================

-- Add new columns to contracts table
ALTER TABLE contracts ADD COLUMN legal_terms TEXT;
ALTER TABLE contracts ADD COLUMN template_id TEXT REFERENCES contract_templates(id);
ALTER TABLE contracts ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE contracts ADD COLUMN parent_contract_id TEXT REFERENCES contracts(id);
ALTER TABLE contracts ADD COLUMN unsigned_document_r2_key TEXT;
ALTER TABLE contracts ADD COLUMN activated_at TEXT;
ALTER TABLE contracts ADD COLUMN completed_at TEXT;
ALTER TABLE contracts ADD COLUMN metadata TEXT;

-- Update status enum to include new states
-- Note: SQLite doesn't support ALTER ENUM, so we recreate the table
CREATE TABLE contracts_new (
  id TEXT PRIMARY KEY,
  trade_id TEXT NOT NULL REFERENCES trades(id),
  instrument_id TEXT NOT NULL REFERENCES instruments(id),
  buyer_org_id TEXT NOT NULL REFERENCES organisations(id),
  seller_org_id TEXT NOT NULL REFERENCES organisations(id),
  contract_type TEXT NOT NULL CHECK(contract_type IN ('spot', 'term', 'vppa', 'physical_ppa', 'wheeling')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'pending_signature', 'partially_signed', 'active', 'completed', 'terminated', 'disputed', 'expired')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_contracted_mwh REAL NOT NULL,
  delivered_mwh REAL NOT NULL DEFAULT 0,
  remaining_mwh REAL NOT NULL,
  price_terms TEXT NOT NULL,
  carbon_terms TEXT,
  wheeling_terms TEXT,
  legal_terms TEXT,
  template_id TEXT REFERENCES contract_templates(id),
  version INTEGER DEFAULT 1,
  parent_contract_id TEXT REFERENCES contracts(id),
  signed_document_r2_key TEXT,
  unsigned_document_r2_key TEXT,
  signed_at TEXT,
  activated_at TEXT,
  completed_at TEXT,
  terminated_at TEXT,
  termination_reason TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Copy existing data
INSERT INTO contracts_new 
SELECT 
  id, trade_id, instrument_id, buyer_org_id, seller_org_id,
  contract_type, 
  CASE 
    WHEN status = 'draft' THEN 'draft'
    WHEN status = 'active' THEN 'active'
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'terminated' THEN 'terminated'
    WHEN status = 'disputed' THEN 'disputed'
    ELSE 'draft'
  END as status,
  start_date, end_date, total_contracted_mwh, delivered_mwh, remaining_mwh,
  price_terms, carbon_terms, wheeling_terms, NULL as legal_terms,
  NULL as template_id, 1 as version, NULL as parent_contract_id,
  signed_document_r2_key, NULL as unsigned_document_r2_key,
  signed_at, NULL as activated_at, NULL as completed_at,
  terminated_at, termination_reason, NULL as metadata,
  created_at, updated_at
FROM contracts;

-- Drop old table and rename new one
DROP TABLE contracts;
ALTER TABLE contracts_new RENAME TO contracts;

-- Recreate indexes
CREATE INDEX idx_contracts_trade ON contracts(trade_id);
CREATE INDEX idx_contracts_buyer_org ON contracts(buyer_org_id);
CREATE INDEX idx_contracts_seller_org ON contracts(seller_org_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_type ON contracts(contract_type);
CREATE INDEX idx_contracts_template ON contracts(template_id);

-- ============================================================================
-- CREATE CONTRACT TEMPLATES TABLE
-- ============================================================================

CREATE TABLE contract_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  contract_type TEXT NOT NULL CHECK(contract_type IN ('spot', 'term', 'vppa', 'physical_ppa', 'wheeling')),
  version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'deprecated')),
  template_document_r2_key TEXT NOT NULL,
  default_terms TEXT NOT NULL,
  required_fields TEXT NOT NULL,
  optional_fields TEXT,
  approval_required BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by_user_id TEXT REFERENCES users(id),
  approved_at TEXT,
  created_by_user_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_templates_type ON contract_templates(contract_type);
CREATE INDEX idx_templates_status ON contract_templates(status);

-- ============================================================================
-- CREATE CONTRACT SIGNATURES TABLE
-- ============================================================================

CREATE TABLE contract_signatures (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  signer_user_id TEXT NOT NULL REFERENCES users(id),
  signer_org_id TEXT NOT NULL REFERENCES organisations(id),
  signer_role TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  signature_type TEXT NOT NULL DEFAULT 'electronic' CHECK(signature_type IN ('electronic', 'digital', 'wet_ink')),
  signature_data TEXT,
  ip_address TEXT,
  user_agent TEXT,
  geolocation TEXT,
  signed_at TEXT NOT NULL,
  certificate_r2_key TEXT,
  witness_user_id TEXT REFERENCES users(id),
  witness_name TEXT,
  witness_email TEXT,
  witness_signed_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'signed', 'declined', 'revoked')),
  declined_reason TEXT,
  revoked_reason TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_signatures_contract ON contract_signatures(contract_id);
CREATE INDEX idx_signatures_user ON contract_signatures(signer_user_id);
CREATE INDEX idx_signatures_status ON contract_signatures(status);
CREATE UNIQUE INDEX idx_unique_contract_signer ON contract_signatures(contract_id, signer_user_id);

-- ============================================================================
-- CREATE CONTRACT AMENDMENTS TABLE
-- ============================================================================

CREATE TABLE contract_amendments (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  amendment_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposed_changes TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'proposed', 'accepted', 'rejected', 'executed')),
  proposed_by_user_id TEXT NOT NULL REFERENCES users(id),
  proposed_at TEXT NOT NULL,
  accepted_by_buyer_user_id TEXT REFERENCES users(id),
  accepted_by_seller_user_id TEXT REFERENCES users(id),
  accepted_at TEXT,
  executed_at TEXT,
  amendment_document_r2_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_amendments_contract ON contract_amendments(contract_id);
CREATE INDEX idx_amendments_status ON contract_amendments(status);

-- ============================================================================
-- CREATE CONTRACT AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE contract_audit_log (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by_user_id TEXT REFERENCES users(id),
  performed_by_org_id TEXT REFERENCES organisations(id),
  changes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_contract_audit_contract ON contract_audit_log(contract_id);
CREATE INDEX idx_contract_audit_action ON contract_audit_log(action);
CREATE INDEX idx_contract_audit_timestamp ON contract_audit_log(timestamp);

-- ============================================================================
-- SEED DATA: DEFAULT CONTRACT TEMPLATES
-- ============================================================================

-- Spot Contract Template
INSERT INTO contract_templates (
  id, name, description, contract_type, version, status,
  template_document_r2_key, default_terms, required_fields,
  approval_required, created_by_user_id, created_at, updated_at
) VALUES (
  'template_spot_001',
  'Spot Trade Contract',
  'Standard contract for immediate energy delivery (1-7 days)',
  'spot',
  '1.0',
  'active',
  'templates/spot-contract-v1.pdf',
  '{
    "payment_terms": "Payment due within 7 days of delivery",
    "delivery_terms": "Delivery as per trade confirmation",
    "measurement": "Settlement based on metered values",
    "imbalance_tolerance": "5% tolerance, 10% penalty on excess"
  }',
  '["delivery_point", "metering_standard", "payment_method"]',
  false,
  'system_admin',
  datetime('now'),
  datetime('now')
);

-- Term Contract Template
INSERT INTO contract_templates (
  id, name, description, contract_type, version, status,
  template_document_r2_key, default_terms, required_fields,
  approval_required, created_by_user_id, created_at, updated_at
) VALUES (
  'template_term_001',
  'Term Supply Contract',
  'Fixed volume contract for medium-term supply (1-5 years)',
  'term',
  '1.0',
  'active',
  'templates/term-contract-v1.pdf',
  '{
    "payment_terms": "Monthly invoicing, Net 30",
    "delivery_terms": "Daily delivery as per schedule",
    "measurement": "Monthly metered values",
    "price_escalation": "CPI-linked annual adjustment",
    "minimum_delivery": "95% of contracted volume",
    "force_majeure": "Standard SA energy market clauses"
  }',
  '["delivery_point", "metering_standard", "payment_method", "escalation_formula"]',
  true,
  'system_admin',
  datetime('now'),
  datetime('now')
);

-- Physical PPA Template
INSERT INTO contract_templates (
  id, name, description, contract_type, version, status,
  template_document_r2_key, default_terms, required_fields,
  approval_required, created_by_user_id, created_at, updated_at
) VALUES (
  'template_ppa_physical_001',
  'Physical Power Purchase Agreement',
  'Long-term physical delivery PPA (5-20 years)',
  'physical_ppa',
  '1.0',
  'active',
  'templates/physical-ppa-v1.pdf',
  '{
    "payment_terms": "Monthly capacity and energy payments",
    "delivery_terms": "Continuous delivery at grid connection point",
    "measurement": "Half-hourly metering data",
    "price_escalation": "CPI + 1% annual escalation",
    "availability_guarantee": "95% minimum availability",
    "performance_standards": "Grid code compliance required",
    "termination": "20-year term with 5-year extension option"
  }',
  '["delivery_point", "metering_standard", "grid_connection_agreement", "environmental_authorization", "wheeling_agreement"]',
  true,
  'system_admin',
  datetime('now'),
  datetime('now')
);

-- Virtual PPA Template
INSERT INTO contract_templates (
  id, name, description, contract_type, version, status,
  template_document_r2_key, default_terms, required_fields,
  approval_required, created_by_user_id, created_at, updated_at
) VALUES (
  'template_vppa_001',
  'Virtual Power Purchase Agreement',
  'Financial PPA with contract for differences (5-15 years)',
  'vppa',
  '1.0',
  'active',
  'templates/vppa-v1.pdf',
  '{
    "payment_terms": "Monthly settlement of contract for differences",
    "strike_price": "Fixed strike price with CPI escalation",
    "measurement": "Monthly generation data",
    "settlement": "Net payment based on market price vs strike price",
    "renewable_certificates": "RECs transferred to buyer",
    "tax_treatment": "Section 80A of Income Tax Act applies"
  }',
  '["strike_price", "reference_market_price", "rec_transfer_terms", "tax_opinion"]',
  true,
  'system_admin',
  datetime('now'),
  datetime('now')
);

-- Wheeling Agreement Template
INSERT INTO contract_templates (
  id, name, description, contract_type, version, status,
  template_document_r2_key, default_terms, required_fields,
  approval_required, created_by_user_id, created_at, updated_at
) VALUES (
  'template_wheeling_001',
  'Wheeling Service Agreement',
  'Transmission service agreement for private power (1-10 years)',
  'wheeling',
  '1.0',
  'active',
  'templates/wheeling-agreement-v1.pdf',
  '{
    "payment_terms": "Monthly wheeling charges",
    "wheeling_charges": "Per kWh transmission fee",
    "losses": "Technical and commercial losses borne by buyer",
    "metering": "Dedicated meters at injection and offtake points",
    "municipal_consent": "All municipalities on path must consent",
    "grid_code": "NERSA grid code compliance required"
  }',
  '["injection_point", "offtake_point", "wheeling_path", "municipal_approvals", "loss_factor"]',
  true,
  'system_admin',
  datetime('now'),
  datetime('now')
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify tables created
SELECT 'contracts' as table_name, COUNT(*) as row_count FROM contracts
UNION ALL
SELECT 'contract_templates', COUNT(*) FROM contract_templates
UNION ALL
SELECT 'contract_signatures', COUNT(*) FROM contract_signatures
UNION ALL
SELECT 'contract_amendments', COUNT(*) FROM contract_amendments
UNION ALL
SELECT 'contract_audit_log', COUNT(*) FROM contract_audit_log;

-- Verify templates seeded
SELECT 
  name as template_name,
  contract_type,
  version,
  status
FROM contract_templates
ORDER BY contract_type, name;
