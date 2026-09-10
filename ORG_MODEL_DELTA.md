# Organization Model Delta - Backend Follow-up

## Overview

This document outlines the backend schema changes required to support the organizational hierarchy implemented in the frontend (CHUNK 01-06).

**Status**: Frontend implementation complete, backend migration needed.

---

## Schema Changes Required

### 1. Products Table (Already Exists)

**Current State**: ✅ Products exist with `tenant_id`

**No Changes Needed**: Products already have proper tenant association.

---

### 2. Departments Table

**Current State**: Departments exist but lack `product_id`

**Required Changes**:
```sql
ALTER TABLE departments 
ADD COLUMN product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE;

CREATE INDEX idx_departments_product_id ON departments(product_id);
```

**Migration Notes**:
- All existing departments must be assigned to a product
- Consider defaulting to a "General" product if needed
- Add validation to ensure product belongs to same tenant

---

### 3. Categories Table

**Current State**: Categories exist but lack `department_id`

**Required Changes**:
```sql
ALTER TABLE categories 
ADD COLUMN department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE;

CREATE INDEX idx_categories_department_id ON categories(department_id);
```

**Migration Notes**:
- All existing categories must be assigned to a department
- Ensure department belongs to same tenant as category
- Maintain existing `parent_id` for subcategories if needed

---

### 4. Topics Table (NEW)

**Current State**: ❌ Table does not exist

**Required Changes**:
```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT uq_topics_slug UNIQUE (slug),
  CONSTRAINT chk_topics_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED'))
);

CREATE INDEX idx_topics_tenant_id ON topics(tenant_id);
CREATE INDEX idx_topics_category_id ON topics(category_id);
CREATE INDEX idx_topics_status ON topics(status);
```

**Notes**:
- Topics are leaf-level classifications under categories
- Each topic belongs to exactly one category
- Slug must be unique across all topics
- Status follows same pattern as other entities

---

### 5. Teams Table

**Current State**: Teams exist but lack scope and category association

**Required Changes**:
```sql
ALTER TABLE teams 
ADD COLUMN scope VARCHAR(50) NOT NULL DEFAULT 'DEPARTMENT',
ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX idx_teams_scope ON teams(scope);
CREATE INDEX idx_teams_category_id ON teams(category_id);

-- Add constraint to ensure category_id is null when scope is DEPARTMENT
ALTER TABLE teams 
ADD CONSTRAINT chk_teams_scope_category 
CHECK (
  (scope = 'DEPARTMENT' AND category_id IS NULL) OR
  (scope = 'CATEGORY' AND category_id IS NOT NULL)
);
```

**Migration Notes**:
- Existing teams should default to `scope = 'DEPARTMENT'`
- `category_id` must be NULL for department-scoped teams
- `category_id` must be NOT NULL for category-scoped teams
- Ensure category belongs to same department as team

---

### 6. Tickets Table

**Current State**: Tickets exist but lack `topic_id`

**Required Changes**:
```sql
ALTER TABLE tickets 
ADD COLUMN topic_id UUID REFERENCES topics(id) ON DELETE SET NULL;

CREATE INDEX idx_tickets_topic_id ON tickets(topic_id);
```

**Migration Notes**:
- `topic_id` is optional (tickets can exist without topic classification)
- When set, ensure topic belongs to ticket's category
- Consider adding validation trigger

---

## Validation Rules

### Cross-Tenant Isolation

All hierarchical relationships must enforce tenant isolation:

```sql
-- Example validation function
CREATE OR REPLACE FUNCTION validate_tenant_isolation()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure all related entities belong to same tenant
  IF NEW.tenant_id != (SELECT tenant_id FROM products WHERE id = NEW.product_id) THEN
    RAISE EXCEPTION 'Product must belong to same tenant';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Cascade Rules

1. **Delete Product** → Cascade delete all departments
2. **Delete Department** → Cascade delete all categories and teams
3. **Delete Category** → Cascade delete all topics, set null on category-scoped teams
4. **Delete Topic** → Set null on tickets with that topic
5. **Delete Team** → Set null on tickets assigned to that team

---

## API Endpoints Needed

### Hierarchy Navigation

```
GET /api/v1/products/:id/departments
GET /api/v1/departments/:id/categories
GET /api/v1/departments/:id/teams
GET /api/v1/categories/:id/topics
GET /api/v1/categories/:id/teams
```

### Filtering

```
GET /api/v1/teams?scope=DEPARTMENT&department_id=:id
GET /api/v1/teams?scope=CATEGORY&category_id=:id
GET /api/v1/tickets?topic_id=:id
GET /api/v1/tickets?team_id=:id
```

### Cascade Assignment

```
POST /api/v1/tickets/:id/assign-cascade
Body: {
  department_id?: string,
  team_id?: string,
  assignee_id?: string
}
```

---

## Migration Strategy

### Phase 1: Schema Changes (Non-Breaking)
1. Add nullable columns to existing tables
2. Create new `topics` table
3. Add indexes

### Phase 2: Data Migration
1. Assign existing departments to products
2. Assign existing categories to departments
3. Set existing teams to `scope = 'DEPARTMENT'`
4. Make columns NOT NULL after data migration

### Phase 3: Validation
1. Add foreign key constraints
2. Add check constraints
3. Add validation triggers

### Phase 4: Cleanup
1. Remove temporary migration columns
2. Update API documentation
3. Deploy frontend with new features

---

## Testing Checklist

- [ ] Can create department under product
- [ ] Can create category under department
- [ ] Can create topic under category
- [ ] Can create department-scoped team
- [ ] Can create category-scoped team
- [ ] Cannot create team with mismatched scope/category
- [ ] Cascade deletes work correctly
- [ ] Tenant isolation enforced at all levels
- [ ] Ticket assignment cascade works
- [ ] Filtering by hierarchy levels works

---

## Rollback Plan

If migration fails:
1. Keep new columns nullable
2. Don't enforce NOT NULL constraints immediately
3. Frontend can handle null values gracefully
4. Rollback script should drop new tables/columns

---

## Timeline Estimate

- **Phase 1**: 2-3 hours (schema changes)
- **Phase 2**: 4-6 hours (data migration)
- **Phase 3**: 2-3 hours (validation)
- **Phase 4**: 1-2 hours (cleanup)
- **Testing**: 4-6 hours
- **Total**: 13-20 hours

---

## Dependencies

- Frontend CHUNK 01-06 complete ✅
- Backend API framework ready
- Database migration tool configured
- Test environment available

---

## Notes

- All UUIDs should use public IDs (not internal BIGINT)
- Maintain audit trail for all hierarchy changes
- Consider soft deletes for hierarchy entities
- Add caching for frequently accessed hierarchy data
- Monitor query performance with new indexes

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: FinoTicket Development Team
