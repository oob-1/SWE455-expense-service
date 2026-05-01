CREATE TABLE IF NOT EXISTS expenses (
    id           BIGSERIAL      PRIMARY KEY,
    user_id      BIGINT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(140)   NOT NULL,
    amount       NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    category     VARCHAR(40)    NOT NULL,
    expense_date DATE           NOT NULL,
    notes        TEXT,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS expenses_user_id_idx          ON expenses (user_id);
CREATE INDEX IF NOT EXISTS expenses_user_date_idx        ON expenses (user_id, expense_date DESC);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS expenses_set_updated_at ON expenses;
CREATE TRIGGER expenses_set_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
