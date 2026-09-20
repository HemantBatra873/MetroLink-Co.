-- =============================================================================
-- Identity & Authorization Platform - PostgreSQL Schema
-- =============================================================================

-- 1. Users Table (Maps to Keycloak 'sub' claim)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_user_id VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(256) NULL,
    display_name VARCHAR(256) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_keycloak_user_id ON users(keycloak_user_id);

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_code ON organizations(code);

-- 3. Organization Units Table (Sub-organizations)
CREATE TABLE IF NOT EXISTS organization_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_unit_id UUID NULL REFERENCES organization_units(id) ON DELETE RESTRICT,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_org_units_org_id ON organization_units(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_units_parent_id ON organization_units(parent_unit_id);

-- 4. Areas Table (Hierarchical Geographic/Authorization Scopes)
CREATE TABLE IF NOT EXISTS areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_area_id UUID NULL REFERENCES areas(id) ON DELETE RESTRICT,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_areas_org_id ON areas(organization_id);
CREATE INDEX IF NOT EXISTS idx_areas_parent_id ON areas(parent_area_id);

-- 5. Permissions Table (Actions)
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(128) NOT NULL UNIQUE,
    description VARCHAR(512) NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);

-- 6. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    code VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_roles_org_id ON roles(organization_id);

-- 7. Role Permissions Join Table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 8. Memberships Table (User + Org + Unit + Role + Scope Area)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    organization_unit_id UUID NULL REFERENCES organization_units(id) ON DELETE RESTRICT,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    scope_area_id UUID NULL REFERENCES areas(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_memberships_user_org ON memberships(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON memberships(role_id);
CREATE INDEX IF NOT EXISTS idx_memberships_scope_area ON memberships(scope_area_id);
