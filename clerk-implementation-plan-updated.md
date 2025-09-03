# Clerk Implementation Plan - Updated

## Step-by-Step Implementation Guide (Revised)

---

## **OVERVIEW**

**Objective**: Migrate from hardcoded auth to Clerk authentication with direct Clerk ID usage and JIT sync strategy.

**Revised Approach**:

- Use Clerk IDs directly in database calls (usr_xid/org_xid fields)
- Remove UUIDs completely (no backward compatibility)
- Implement JIT (Just-in-Time) sync for immediate functionality
- Prepare for future webhook integration
- **Major refactoring required** - almost all PostgreSQL functions need updates

---

## **REVISED SCOPE & IMPACT**

### **Major Refactoring Required:**

Based on analysis, almost ALL PostgreSQL functions need refactoring to use Clerk IDs instead of UUIDs:

#### **Functions Requiring Updates:**

- ✅ **Core functions**: `_fn_get_usr_id`, `_fn_get_org_id`, `fn_get_usr_orgs`, `_fn_set_app_context`
- ✅ **User/Org functions**: `fn_create_usr`, `fn_create_organization` (add usr_xid/org_xid fields)
- ✅ **ALL business logic functions**: Every function in `fn_item.sql`, `fn_trans.sql`, etc. that calls `_fn_set_app_context`
- ✅ **Application layer**: `dataServices.js`, validation schemas, all RPC calls

#### **Database Schema Changes:**

```sql
-- Replace UUIDs with Clerk IDs (no backward compatibility)
ALTER TABLE usrs.usr ADD COLUMN usr_xid VARCHAR(50) UNIQUE;
ALTER TABLE orgs.org ADD COLUMN org_xid VARCHAR(50) UNIQUE;
ALTER TABLE usrs.usr DROP COLUMN usr_uuid;
ALTER TABLE orgs.org DROP COLUMN org_uuid;
```

#### **Data Payload Changes:**

```javascript
// OLD: UUID-based
let _data = { _usr_uuid: "uuid", _org_uuid: "uuid" };

// NEW: Clerk ID-based
let _data = { usr_xid: "user_123", org_xid: "org_456" };
```

---

## **PHASE 1: DATABASE PREPARATION**

### **Step 1.1: Add Clerk ID Columns & Remove UUIDs**

```sql
-- Add Clerk ID columns to existing tables (replacing UUIDs)
ALTER TABLE usrs.usr ADD COLUMN IF NOT EXISTS usr_xid VARCHAR(50) UNIQUE;
ALTER TABLE orgs.org ADD COLUMN IF NOT EXISTS org_xid VARCHAR(50) UNIQUE;

-- Remove UUID columns (no backward compatibility needed)
ALTER TABLE usrs.usr DROP COLUMN IF EXISTS usr_uuid;
ALTER TABLE orgs.org DROP COLUMN IF EXISTS org_uuid;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_usr_xid ON usrs.usr(usr_xid);
CREATE INDEX IF NOT EXISTS idx_org_xid ON orgs.org(org_xid);

-- Add composite index for user-org lookups
CREATE INDEX IF NOT EXISTS idx_usr_org_lookup
ON usrs.usr_org(usr_id, org_id)
WHERE active = true;
```

### **Step 1.2: Update Core Utility Functions**

#### **A. Modified Core Functions (Update Existing)**

```sql
-- Update existing _fn_get_usr_id to accept Clerk ID instead of UUID
CREATE OR REPLACE FUNCTION utils._fn_get_usr_id(_usr_xid VARCHAR(50))
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = utils
AS $$
DECLARE
  _usr_id INTEGER;
BEGIN
  SELECT u.usr_id INTO STRICT _usr_id
  FROM usrs.usr u
  WHERE u.usr_xid = _usr_xid;

  IF _usr_id IS NULL THEN
    RAISE EXCEPTION 'usr_id is unexpectedly NULL for usr_xid %', _usr_xid;
  END IF;
  RETURN _usr_id;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE EXCEPTION 'User % not found.', _usr_xid;
  WHEN TOO_MANY_ROWS THEN
    RAISE EXCEPTION 'User % not unique. Contact system admin.', _usr_xid;
  WHEN OTHERS THEN
    RAISE;
END;
$$;

ALTER FUNCTION utils._fn_get_usr_id OWNER TO utils_admin;

-- Update existing _fn_get_org_id to accept Clerk ID instead of UUID
CREATE OR REPLACE FUNCTION utils._fn_get_org_id(_org_xid VARCHAR(50))
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = utils
AS $$
DECLARE
  _org_id INTEGER;
BEGIN
  SELECT o.org_id INTO STRICT _org_id
  FROM orgs.org o
  WHERE o.org_xid = _org_xid;

  IF _org_id IS NULL THEN
    RAISE EXCEPTION 'org_id is unexpectedly NULL for org_xid %', _org_xid;
  END IF;
  RETURN _org_id;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE EXCEPTION 'Organization % not found.', _org_xid;
  WHEN TOO_MANY_ROWS THEN
    RAISE EXCEPTION 'Organization % not unique. Contact system admin.', _org_xid;
  WHEN OTHERS THEN
    RAISE;
END;
$$;

ALTER FUNCTION utils._fn_get_org_id OWNER TO utils_admin;

-- Update existing fn_get_usr_orgs to accept Clerk ID instead of UUID
CREATE OR REPLACE FUNCTION utils.fn_get_usr_orgs(_usr_xid VARCHAR(50))
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = utils
AS $$
DECLARE
  _result JSON;
BEGIN
  SELECT to_json(_data) INTO _result
  FROM (
    SELECT
      u.usr_xid,
      u.usr_name,
      json_agg(json_build_object('org_xid', o.org_xid, 'org_name', o.org_name)) AS orgs
    FROM usrs.usr u
    JOIN usrs.usr_org uo ON u.usr_id = uo.usr_id
    JOIN orgs.org o ON uo.org_id = o.org_id
    WHERE u.usr_xid = _usr_xid AND uo.active = true
    GROUP BY u.usr_xid, u.usr_name
  ) AS _data;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The user is not authorized in any Organization.';
  END IF;
  RETURN _result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

ALTER FUNCTION utils.fn_get_usr_orgs OWNER TO utils_admin;
```

#### **B. JIT Sync Function (Handles Assignment & Unassignment)**

```sql
-- Atomic function to ensure user, org, and membership exist/updated
CREATE OR REPLACE FUNCTION utils.fn_sync_x_usr_org(
  _clerk_usr_data JSONB,
  _clerk_org_data JSONB,
  _membership_active BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = utils
AS $$
DECLARE
  _usr_id INTEGER;
  _org_id INTEGER;
  _result JSONB;
BEGIN
  -- UPSERT user (no UUIDs)
  INSERT INTO usrs.usr (
    usr_xid,
    usr_name,
    first_name,
    last_name,
    email,
    created_by
  )
  VALUES (
    _clerk_usr_data->>'id',
    COALESCE(_clerk_usr_data->>'username', _clerk_usr_data->>'email'),
    _clerk_usr_data->>'first_name',
    _clerk_usr_data->>'last_name',
    _clerk_usr_data->>'email',
    1 -- System user for JIT creation
  )
  ON CONFLICT (usr_xid) DO UPDATE SET
  usr_name = COALESCE(EXCLUDED.usr_name, usrs.usr.usr_name),
    first_name = COALESCE(EXCLUDED.first_name, usrs.usr.first_name),
    last_name = COALESCE(EXCLUDED.last_name, usrs.usr.last_name),
    email = COALESCE(EXCLUDED.email, usrs.usr.email),
    modified_at = NOW(),
    modified_by = 1
  RETURNING usr_id INTO _usr_id;

  -- UPSERT organization (no UUIDs)
  INSERT INTO orgs.org (
    org_xid,
    org_name,
    org_desc,
    created_by
  )
  VALUES (
    _clerk_org_data->>'id',
    _clerk_org_data->>'name',
    _clerk_org_data->>'description',
    _usr_id
  )
  ON CONFLICT (org_xid) DO UPDATE SET
    org_name = COALESCE(EXCLUDED.org_name, orgs.org.org_name),
    org_desc = COALESCE(EXCLUDED.org_desc, orgs.org.org_desc),
    modified_at = NOW(),
    modified_by = _usr_id
  RETURNING org_id INTO _org_id;

  -- UPSERT user-org membership (handles assignment/unassignment)
  INSERT INTO usrs.usr_org (
    usr_id,
    org_id,
    active,
    role,
    created_by
  )
  VALUES (
    _usr_id,
    _org_id,
    _membership_active,  -- true for assignment, false for unassignment
    COALESCE(_clerk_org_data->>'role', 'member'),
    _usr_id
  )
  ON CONFLICT (usr_id, org_id) DO UPDATE SET
    active = _membership_active,  -- Update active status
    role = COALESCE(EXCLUDED.role, usrs.usr_org.role),
    modified_at = NOW(),
    modified_by = _usr_id;

  -- Return simple success response (no internal IDs needed)
  SELECT jsonb_build_object(
    'success', true,
    'message', CASE
      WHEN _membership_active THEN 'User assigned to organization successfully'
      ELSE 'User unassigned from organization successfully'
    END
  ) INTO _result;

  RETURN _result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN jsonb_build_object(
      'success', false,
      'message', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

ALTER FUNCTION utils.fn_sync_x_usr_org OWNER TO utils_admin;
```

#### **C. Updated App Context Function**

```sql
-- Enhanced _fn_set_app_context to use Clerk IDs (usr_xid/org_xid)
CREATE OR REPLACE FUNCTION utils._fn_set_app_context(
  IN _data JSONB,
  IN _keys_param TEXT[] DEFAULT NULL,
  _fn_name TEXT DEFAULT '',
  _option TEXT DEFAULT 'record'
)
RETURNS TABLE(
  _usr_id INTEGER,
  _org_id INTEGER,
  _is_context_set BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = utils
AS $$
BEGIN
  _is_context_set := FALSE;

  -- option should be record or trans
  IF _option NOT IN('record', 'trans') THEN
    RAISE EXCEPTION 'Invalid context option: %, must be one of record or trans', _option;
  END IF;

  -- _keys_param should not be null or empty array for 'record'
  IF _option = 'record' AND (_keys_param IS NULL OR array_length(_keys_param, 1) IS NULL) THEN
    RAISE EXCEPTION '_keys_param cannot be null or empty array in a record function.';
  END IF;

  -- verify level 1 input parameters:
  PERFORM _fn_assert_input_keys_param(_data, _keys_param, _fn_name);

  -- get user id using Clerk ID (usr_xid)
  SELECT _fn_get_usr_id((_data ->> 'usr_xid')::VARCHAR) INTO _usr_id;

  -- get org_id using Clerk ID (org_xid)
  SELECT _fn_get_org_id((_data ->> 'org_xid')::VARCHAR) INTO _org_id;

  -- confirm user is authorized in organization
  PERFORM _fn_assert_usr_org_auth(_usr_id, _org_id);

  -- set rls for org_id
  IF _fn_set_org_rls(_org_id) THEN
    _is_context_set := TRUE;
  END IF;

  IF _option = 'trans' THEN
    -- validating trx input requires org context in place
    PERFORM _fn_assert_valid_item_trx_input(_data);
  END IF;

  RAISE NOTICE 'current db_session_user: %', CURRENT_USER;
  RAISE NOTICE 'current rls.org_id: %', CURRENT_SETTING('rls.org_id', TRUE);
  RAISE NOTICE '_usr_id: %', _usr_id;
  RAISE NOTICE '_org_id: %', _org_id;
  RAISE NOTICE '_is_context_set: %', UPPER(_is_context_set::TEXT);

  RETURN QUERY
  SELECT _usr_id, _org_id, _is_context_set;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

ALTER FUNCTION utils._fn_set_app_context OWNER TO utils_admin;
```

### **Step 1.3: Test Database Functions**

```sql
-- Test the updated functions with Clerk IDs
SELECT fn_sync_x_usr_org(
  '{"id": "user_test123", "username": "testuser", "first_name": "Test", "last_name": "User", "email": "test@example.com"}'::jsonb,
  '{"id": "org_test123", "name": "Test Organization", "description": "Test org description"}'::jsonb,
  true
);

-- Test retrieval
SELECT fn_get_usr_orgs('user_test123');

-- Test app context
SELECT utils._fn_set_app_context(
  '{"usr_xid": "user_test123", "org_xid": "org_test123"}'::jsonb,
  ARRAY['usr_xid', 'org_xid'],
  'test_function'
);
```

---

---

## **PHASE 2: SERVER-SIDE AUTH INTEGRATION**

### **Step 2.1: Create Auth Utility Functions**

#### **File: `app/_lib/auth/server.js`**

```javascript
"use server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "../data/server/supabase";

// Get current auth context from Clerk
export async function getAuthContext() {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    redirect("/sign-in");
  }

  return { userId, orgId };
}

// Get detailed user data from Clerk
export async function getClerkUserData(clerkUserId) {
  try {
    const user = await clerkClient.users.getUser(clerkUserId);

    return {
      id: user.id,
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.primaryEmailAddress?.emailAddress,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching Clerk user data:", error);
    throw new Error(`Failed to fetch user data: ${error.message}`);
  }
}

// Get detailed organization data from Clerk
export async function getClerkOrgData(clerkOrgId) {
  try {
    const organization = await clerkClient.organizations.getOrganization({
      organizationId: clerkOrgId,
    });

    return {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.publicMetadata?.description,
      created_at: organization.createdAt,
      updated_at: organization.updatedAt,
      created_by: organization.createdBy,
      role: "member", // Default role, can be enhanced with membership data
    };
  } catch (error) {
    console.error("Error fetching Clerk org data:", error);
    throw new Error(`Failed to fetch organization data: ${error.message}`);
  }
}

// Get user's role in the organization
export async function getUserOrgRole(clerkUserId, clerkOrgId) {
  try {
    const membership =
      await clerkClient.organizations.getOrganizationMembership({
        organizationId: clerkOrgId,
        userId: clerkUserId,
      });

    return membership.role; // 'admin', 'basic_member', etc.
  } catch (error) {
    console.error("Error fetching user org role:", error);
    return "member"; // Default fallback
  }
}

// Enhanced function that gets both user and org data with role
export async function getClerkUserOrgData(clerkUserId, clerkOrgId) {
  try {
    const [userData, orgData, userRole] = await Promise.all([
      getClerkUserData(clerkUserId),
      getClerkOrgData(clerkOrgId),
      getUserOrgRole(clerkUserId, clerkOrgId),
    ]);

    // Add role to org data
    orgData.role = userRole;

    return { userData, orgData };
  } catch (error) {
    console.error("Error fetching Clerk user/org data:", error);
    throw error;
  }
}

// Robust error handling version
export async function getClerkUserOrgDataSafe(clerkUserId, clerkOrgId) {
  try {
    return await getClerkUserOrgData(clerkUserId, clerkOrgId);
  } catch (error) {
    // Fallback to minimal data if Clerk API fails
    console.warn("Clerk API failed, using minimal data:", error);

    return {
      userData: {
        id: clerkUserId,
        username: `user_${clerkUserId}`,
        first_name: "Unknown",
        last_name: "User",
        email: null,
      },
      orgData: {
        id: clerkOrgId,
        name: `org_${clerkOrgId}`,
        description: "Organization",
        role: "member",
      },
    };
  }
}
```

---

## **PHASE 3: BUSINESS LOGIC FUNCTIONS REFACTORING**

### **Step 3.1: Update ALL Business Logic Functions**

**Every function in the following files needs refactoring:**

- `db/functions/fn_item.sql` - All item-related functions
- `db/functions/fn_trans.sql` - All transaction functions
- Any other function files that call `_fn_set_app_context`

**Pattern for Updates:**

```sql
-- OLD: Functions expecting UUID parameters
CREATE OR REPLACE FUNCTION fn_get_items(_data JSONB)
-- Expected: {"_usr_uuid": "uuid", "_org_uuid": "uuid", "_item_id": 123}

-- NEW: Functions expecting Clerk ID parameters
CREATE OR REPLACE FUNCTION fn_get_items(_data JSONB)
-- Expected: {"usr_xid": "user_123", "org_xid": "org_456", "_item_id": 123}
```

### **Step 3.2: Update User/Org Creation Functions**

#### **Enhanced fn_create_usr:**

```sql
CREATE OR REPLACE FUNCTION utils.fn_create_usr(_data JSONB)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = utils
AS $$
DECLARE
  _usr_xid VARCHAR(50) := NULL;
  _success BOOLEAN := FALSE;
BEGIN
  -- verify input parameters (updated for Clerk IDs)
  PERFORM _fn_assert_input_keys_param(_data, ARRAY['_usr_name', '_first_name', '_last_name', '_email', 'usr_xid']);

  -- validate if user already exists
  PERFORM _fn_assert_usr_not_exist((_data ->> '_usr_name')::TEXT);

  -- create usr with Clerk ID
  INSERT INTO usrs.usr(
    usr_xid,
    usr_name,
    first_name,
    last_name,
    email
  )
  VALUES (
    _data ->> 'usr_xid',
    _data ->> '_usr_name',
    _data ->> '_first_name',
    _data ->> '_last_name',
    _data ->> '_email'
  )
  RETURNING usr_xid INTO _usr_xid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User % could not be created.', _data ->> '_usr_name';
  END IF;
  _success := TRUE;

  RETURN json_build_object('usr_xid', _usr_xid, 'success', _success);

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

ALTER FUNCTION utils.fn_create_usr OWNER TO utils_admin;
```

---

## **PHASE 4: APPLICATION LAYER UPDATES**

### **Step 4.1: Update DataServices**

#### **File: `app/_lib/data/server/dataServices.js`**

```javascript
"server-only";

import { getEntityFieldMapping } from "@/app/_utils/helpers-server";
import { revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { appContextSchema } from "../../validation/buildValidationSchema";
import { supabase } from "./supabase";
import {
  getAuthContext,
  getClerkUserData,
  getClerkOrgData,
  getClerkUserOrgData,
} from "../../auth/server";

export async function createDataService(globalOptions = {}) {
  // Get auth context from Clerk
  const { userId, orgId } = await getAuthContext();

  // Get detailed user and org data from Clerk
  const { userData, orgData } = await getClerkUserOrgData(userId, orgId);

  // Ensure user and org data exists in our database (JIT sync)
  const syncResult = await supabase.rpc("fn_ensure_user_org_exists", {
    _clerk_usr_data: userData,
    _clerk_org_data: orgData,
    _membership_active: true,
  });

  if (!syncResult.data?.success) {
    throw new Error(`Sync failed: ${syncResult.data?.message}`);
  }

  // Prepare data for database calls (using new field names)
  let _data = {
    usr_xid: userId, // Clerk user ID
    org_xid: orgId, // Clerk org ID
  };

  // Validate app context (update schema to use Clerk IDs)
  const validatedAppContext = await appContextSchema.safeParseAsync({
    usr_xid: userId,
    org_xid: orgId,
  });

  if (!validatedAppContext.success) {
    console.error(z.prettifyError(validatedAppContext.error));
    return {
      error: z.prettifyError(validatedAppContext.error),
    };
  }

  const {
    forceRefresh: globalForceRefresh = false,
    cacheTTL: globalCacheTTL = 300,
    skipCache: globalSkipCache = false,
    ...additionalGlobalOptions
  } = globalOptions;

  return {
    getItems: async (params) => {
      const { id: itemId = "all", options = {}, ...otherParams } = params;

      const {
        forceRefresh = globalForceRefresh,
        cacheTTL = globalCacheTTL,
        skipCache = globalSkipCache,
        ...additionalMethodOptions
      } = { ...additionalGlobalOptions, ...options };

      // Update cache key to use Clerk IDs
      const cacheKey = `item-${orgId}-${itemId}`;
      const cacheTag = `item-${orgId}-${itemId}`;

      if (forceRefresh) {
        revalidateTag(cacheTag);
      }

      if (skipCache) {
        const filteredData = {
          _item_id: itemId === "all" ? null : itemId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_items", {
          _data: filteredData,
        });
        if (error) throw new Error("Item(s) could not be loaded.");
        return data ?? [];
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _item_id: itemId === "all" ? null : itemId,
            ..._data,
            ...otherParams,
          };
          const { data, error } = await supabase.rpc("fn_get_items", {
            _data: filteredData,
          });
          if (error) throw new Error("Item(s) could not be loaded.");
          return data ?? [];
        },
        [cacheKey],
        {
          tags: [cacheTag],
          revalidate: cacheTTL,
          ...additionalMethodOptions,
        },
      )();
    },

    // Update all other methods similarly...
    // getLocations, getBins, getItemClasses, etc.
    // Replace _org_uuid with orgId in cache keys and tags
  };
}
```

### **Step 4.2: Update Validation Schema**

#### **File: `app/_lib/validation/buildValidationSchema.js`**

```javascript
// Update appContextSchema to use Clerk IDs (usr_xid/org_xid)
export const appContextSchema = z.object({
  usr_xid: z.string().min(1, { message: "Unauthorized. Invalid usr_xid" }),
  org_xid: z.string().min(1, { message: "Unauthorized. Invalid org_xid" }),
});
```

---

## **IMPLEMENTATION TIMELINE (REVISED)**

### **Week 1: Database Schema & Core Functions**

- **Days 1-2**: Database schema changes (add usr_xid/org_xid, remove UUIDs)
- **Days 3-4**: Update core utility functions (`_fn_get_usr_id`, `_fn_get_org_id`, `_fn_set_app_context`)
- **Day 5**: Create `fn_sync_x_usr_org` function

### **Week 2: Business Logic Functions**

- **Days 1-3**: Refactor ALL functions in `fn_item.sql`, `fn_trans.sql`, etc.
- **Days 4-5**: Update user/org creation functions

### **Week 3: Application Layer**

- **Days 1-2**: Update `dataServices.js` and validation schemas
- **Days 3-4**: Update all RPC calls across the application
- **Day 5**: Integration testing

### **Week 4: Testing & Optimization**

- **Days 1-3**: Comprehensive testing of all functionality
- **Days 4-5**: Performance optimization and bug fixes

### **Future**: Webhook Integration (Phase 7)

---

## **PHASE 7: WEBHOOK INTEGRATION (FUTURE)**

### **Step 7.1: Webhook Endpoint Implementation**

#### **File: `app/api/webhooks/clerk/route.js`**

```javascript
import { supabase } from "@/app/_lib/data/server/supabase";
import { getClerkUserData, getClerkOrgData } from "@/app/_lib/auth/server";

export async function POST(req) {
  const { type, data } = await req.json();

  try {
    switch (type) {
      case "user.created":
        await handleUserCreated(data);
        break;
      case "organization.created":
        await handleOrganizationCreated(data);
        break;
      case "organizationMembership.created":
        await handleMembershipCreated(data);
        break;
      case "organizationMembership.deleted":
        await handleMembershipDeleted(data);
        break;
      case "organizationMembership.updated":
        await handleMembershipUpdated(data);
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Error", { status: 500 });
  }
}

async function handleUserCreated(webhookData) {
  // Webhook data already contains user info
  const userData = {
    id: webhookData.id,
    username: webhookData.username,
    first_name: webhookData.first_name,
    last_name: webhookData.last_name,
    email: webhookData.email_addresses?.[0]?.email_address,
  };

  // Create minimal org data (user might not be in any org yet)
  const orgData = {
    id: "temp", // Placeholder
    name: "Personal",
    description: "Personal workspace",
  };

  await supabase.rpc("fn_sync_x_usr_org", {
    _clerk_usr_data: userData,
    _clerk_org_data: orgData,
    _membership_active: false, // No org membership yet
  });
}

async function handleOrganizationCreated(webhookData) {
  // Organization created - sync to database
  const orgData = {
    id: webhookData.id,
    name: webhookData.name,
    slug: webhookData.slug,
    description: webhookData.public_metadata?.description,
    created_by: webhookData.created_by,
  };

  // Get creator user data
  const userData = await getClerkUserData(webhookData.created_by);

  await supabase.rpc("fn_sync_x_usr_org", {
    _clerk_usr_data: userData,
    _clerk_org_data: orgData,
    _membership_active: true, // Creator is automatically a member
  });
}

async function handleMembershipCreated(webhookData) {
  // Get full user and org data from Clerk
  const userData = await getClerkUserData(webhookData.public_user_data.user_id);
  const orgData = await getClerkOrgData(webhookData.organization.id);

  // Add role from webhook
  orgData.role = webhookData.role;

  await supabase.rpc("fn_sync_x_usr_org", {
    _clerk_usr_data: userData,
    _clerk_org_data: orgData,
    _membership_active: true, // User assigned to org
  });
}

async function handleMembershipDeleted(webhookData) {
  // For deletion, we only need IDs
  const userData = { id: webhookData.public_user_data.user_id };
  const orgData = { id: webhookData.organization.id };

  await supabase.rpc("fn_sync_x_usr_org", {
    _clerk_usr_data: userData,
    _clerk_org_data: orgData,
    _membership_active: false, // User unassigned from org
  });
}

async function handleMembershipUpdated(webhookData) {
  // Get full data and update role
  const userData = await getClerkUserData(webhookData.public_user_data.user_id);
  const orgData = await getClerkOrgData(webhookData.organization.id);

  orgData.role = webhookData.role; // Updated role

  await supabase.rpc("fn_sync_x_usr_org", {
    _clerk_usr_data: userData,
    _clerk_org_data: orgData,
    _membership_active: true, // Still active, just role changed
  });
}
```

### **Step 7.2: Webhook Configuration**

#### **Clerk Dashboard Setup:**

1. **Navigate to Webhooks** in Clerk Dashboard
2. **Add Endpoint**: `https://yourdomain.com/api/webhooks/clerk`
3. **Select Events**:
   - `user.created`
   - `user.updated`
   - `organization.created`
   - `organization.updated`
   - `organizationMembership.created`
   - `organizationMembership.deleted`
   - `organizationMembership.updated`
4. **Configure Signing Secret** for webhook verification

#### **Environment Variables:**

```bash
# Add to .env.local
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### **Webhook Verification (Security):**

```javascript
import { Webhook } from "svix";

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env.local");
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // Get body
  const payload = await req.text();

  // Create new Svix instance with secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  // Process the verified webhook
  const { type, data } = evt;
  // ... rest of webhook handling
}
```

---

## **DATA FLOW SUMMARY**

### **JIT Sync Flow:**

```
1. User authenticates → auth() returns userId + orgId
2. getClerkUserData(userId) → Fetch user details from Clerk API
3. getClerkOrgData(orgId) → Fetch org details from Clerk API
4. fn_sync_x_usr_org() → UPSERT to local database
5. Continue with business logic using usr_xid/org_xid
```

### **Webhook Sync Flow:**

```
1. Clerk sends webhook → Contains user/org data
2. Extract data from webhook payload
3. Optionally fetch additional data from Clerk API
4. fn_sync_x_usr_org() → UPSERT to local database
5. JIT sync becomes fast lookup instead of creation
```

### **Hybrid Flow Benefits:**

- **Real-time updates** via webhooks when available
- **Fallback to JIT sync** when webhooks fail or are delayed
- **Self-healing system** that works regardless of external dependencies
- **Performance optimization** - most requests use pre-synced data

---

## **USAGE EXAMPLES**

### **JIT Sync Usage:**

```javascript
// Ensure user/org exists when user authenticates
const result = await supabase.rpc("fn_sync_x_usr_org", {
  _clerk_usr_data: {
    _usr_name: "john_doe",
    _usr_xid: "user_123",
    _first_name: "John",
    _last_name: "Doe",
    _email: "john@example.com",
  },
  _clerk_org_data: {
    org_xid: "org_456",
    org_name: "Acme Corp",
    org_desc: "Sample organization",
  },
  _membership_active: true,
});
// Returns: {"success": true, "message": "User assigned to organization successfully"}
```

### **Webhook Usage:**

```javascript
// Handle user unassignment
const result = await supabase.rpc("fn_sync_x_usr_org", {
  _clerk_usr_data: { id: "user_123" },
  _clerk_org_data: { id: "org_456" },
  _membership_active: false, // Unassignment
});
// Returns: {"success": true, "message": "User unassigned from organization successfully"}
```

---

## **SUCCESS CRITERIA**

- [ ] All existing functionality works with Clerk authentication
- [ ] Database functions use usr_xid/org_xid instead of UUIDs
- [ ] JIT sync handles user/org creation and membership management
- [ ] Organization switching works with redirect approach
- [ ] System handles user unassignment scenarios
- [ ] Performance is maintained or improved
- [ ] Comprehensive error handling is in place
- [ ] System is ready for future webhook integration

---

**Document Status**: Updated Implementation Guide  
**Created**: January 2025  
**Last Updated**: January 2025 (Major revision based on scope analysis)  
**Priority**: High  
**Estimated Effort**: 5 weeks (revised to include auth integration)  
**Dependencies**: Clerk setup, Database access
