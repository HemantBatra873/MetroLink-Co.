-- Optional reference schema for parking_db (EF migrations are authoritative for the API).
-- Run after: docker compose up -d postgres-parking

CREATE TABLE IF NOT EXISTS parking_facilities (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    owner_organization_id UUID NOT NULL,
    operator_organization_id UUID NOT NULL,
    area_id UUID NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL,
    total_capacity INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    UNIQUE (organization_id, code)
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_parking_tickets_ticket_number ON parking_tickets (ticket_number);
