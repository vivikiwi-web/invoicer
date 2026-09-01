const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    locale TEXT NOT NULL DEFAULT 'lt' CHECK (locale IN ('lt', 'en')),
    token_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS company_settings (
    user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name     TEXT NOT NULL DEFAULT '',
    logo_url         TEXT NOT NULL DEFAULT '',
    address          TEXT NOT NULL DEFAULT '',
    email            TEXT NOT NULL DEFAULT '',
    phone            TEXT NOT NULL DEFAULT '',
    currency         TEXT NOT NULL DEFAULT 'EUR',
    tax_rate         NUMERIC(6,3) NOT NULL DEFAULT 0,
    invoice_prefix   TEXT NOT NULL DEFAULT 'INV-',
    next_seq         INTEGER NOT NULL DEFAULT 1,
    accent_color     TEXT NOT NULL DEFAULT '',
    default_document_language TEXT NOT NULL DEFAULT 'lt' CHECK (default_document_language IN ('lt', 'en')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL DEFAULT '',
    company     TEXT NOT NULL DEFAULT '',
    phone       TEXT NOT NULL DEFAULT '',
    address     TEXT NOT NULL DEFAULT '',
    notes       TEXT NOT NULL DEFAULT '',
    document_language TEXT CHECK (document_language IS NULL OR document_language IN ('lt', 'en')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

CREATE TABLE IF NOT EXISTS invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
    invoice_number  TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
    issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE,
    currency        TEXT NOT NULL DEFAULT 'EUR',
    tax_rate        NUMERIC(6,3) NOT NULL DEFAULT 0,  -- percent
    discount        NUMERIC(12,2) NOT NULL DEFAULT 0, -- flat amount
    subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    total           NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes           TEXT NOT NULL DEFAULT '',
    terms           TEXT NOT NULL DEFAULT '',
    document_language TEXT NOT NULL DEFAULT 'lt' CHECK (document_language IN ('lt', 'en')),
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_invoice_number ON invoices(user_id, invoice_number);

CREATE TABLE IF NOT EXISTS invoice_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL DEFAULT '',
    quantity    NUMERIC(12,2) NOT NULL DEFAULT 1,
    rate        NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    position    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_items_invoice ON invoice_items(invoice_id);

-- Reusable products / services catalog
CREATE TABLE IF NOT EXISTS catalog_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    rate        NUMERIC(12,2) NOT NULL DEFAULT 0,
    unit        TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_user ON catalog_items(user_id);

-- Business expenses (optionally created from an AI-parsed receipt)
CREATE TABLE IF NOT EXISTS expenses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor      TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT 'General',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency    TEXT NOT NULL DEFAULT 'EUR',
    notes       TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);

-- Payments recorded against invoices
CREATE TABLE IF NOT EXISTS payments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    method      TEXT NOT NULL DEFAULT '',
    paid_on     DATE NOT NULL DEFAULT CURRENT_DATE,
    notes       TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

CREATE TABLE IF NOT EXISTS ai_usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    model TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    fallback_used BOOLEAN NOT NULL DEFAULT false,
    input_tokens INTEGER,
    output_tokens INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_created ON ai_usage_events(user_id, created_at DESC);
`;

module.exports = { SCHEMA_SQL };
