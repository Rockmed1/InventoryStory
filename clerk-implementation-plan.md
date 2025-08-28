# Clerk Implementation Plan
## Step-by-Step Implementation Guide

---

## **OVERVIEW**

**Objective**: Migrate from hardcoded auth to Clerk authentication with direct Clerk ID usage and JIT sync strategy.

**Approach**: 
- Use Clerk IDs directly in database calls
- Implement JIT (Just-in-Time) sync for immediate functionality
- Prepare for future webhook integration
- Consolidate related database operations into single functions

---

## **PHASE 1: DATABASE PREPARATION**

### **Step 1.1: Add Clerk ID Columns**
```sql
-- Add Clerk ID columns to existing tables
ALTER TABLE usrs.usr ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(50) UNIQUE;
ALTER TABLE orgs.org ADD COLUMN IF NOT EXISTS clerk_org_id VARCHAR(50) UNIQUE;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_usr_clerk_id ON usrs.usr(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_org_clerk_id ON orgs.org(clerk_org_id);

-- Add composite index for user-org lookups
CREATE INDEX IF NOT EXISTS idx_usr_org_clerk_lookup 
ON usrs.usr_org(usr_id, org_id) 
WHERE active = true;
```

### **Step 1.2: Create Consolidated Database Functions**

#### **A. User/Org Data Retrieval Function**
```sql
-- Function to get user, org, and membership data in one call
CREATE OR REPLACE FUNCTION fn_get_user_org_data(
  _clerk_user_id VARCHAR(50),
  _clerk_org_id VARCHAR(50)
)
RETURNS JSONB AS $$
DECLARE
  _result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'userData', jsonb_build_object(
      'usr_id', u.usr_id,
      'usr_uuid', u.usr_uuid,
      'clerk_user_id', u.clerk_user_id,
      'usr_name', u.usr_name,
      'first_name', u.first_name,
      'last_name', u.last_name,
      'email', u.email
    ),
    'orgData', jsonb_build_object(
      'org_id', o.org_id,
      'org_uuid', o.org_uuid,
      'clerk_org_id', o.clerk_org_id,
      'org_name', o.org_name,
      'org_desc', o.org_desc
    ),
    'membershipData', jsonb_build_object(
      'usr_org_id', uo.usr_org_id,
      'role', COALESCE(uo.role, 'member'),
      'active', uo.active,
      'created_at', uo.created_at
    )
  ) INTO _result
  FROM usrs.usr u
  JOIN usrs.usr_org uo ON u.usr_id = uo.usr_id
  JOIN orgs.org o ON uo.org_id = o.org_id
  WHERE u.clerk_user_id = _clerk_user_id 
    AND o.clerk_org_id = _clerk_org_id
    AND uo.active = true;

  RETURN _result;
END;
$$ LANGUAGE plpgsql;
```

#### **B. JIT Sync Function**
```sql
-- Atomic function to ensure user, org, and membership exist
CREATE OR REPLACE FUNCTION fn_ensure_user_org_exists(
  _clerk_user_data JSONB,
  _clerk_org_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  _usr_id INTEGER;
  _org_id INTEGER;
  _usr_org_id INTEGER;
  _result JSONB;
BEGIN
  -- Ensure user exists (upsert)
  INSERT INTO usrs.usr (
    clerk_user_id,
    usr_name,
    first_name,
    last_name,
    email,
    usr_uuid,
    created_by
  )
  VALUES (
    _clerk_user_data->>'id',
    COALESCE(_clerk_user_data->>'username', _clerk_user_data->>'email'),
    _clerk_user_data->>'first_name',
    _clerk_user_data->>'last_name',
    _clerk_user_data->>'email',
    gen_random_uuid(),
    1 -- System user for JIT creation
  )
  ON CONFLICT (clerk_user_id) DO UPDATE SET
    usr_name = COALESCE(EXCLUDED.usr_name, usrs.usr.usr_name),
    first_name = COALESCE(EXCLUDED.first_name, usrs.usr.first_name),
    last_name = COALESCE(EXCLUDED.last_name, usrs.usr.last_name),
    email = COALESCE(EXCLUDED.email, usrs.usr.email),
    modified_at = NOW(),
    modified_by = 1
  RETURNING usr_id INTO _usr_id;

  -- Ensure org exists (upsert)
  INSERT INTO orgs.org (
    clerk_org_id,
    org_name,
    org_desc,
    org_uuid,
    created_by
  )
  VALUES (
    _clerk_org_data->>'id',
    _clerk_org_data->>'name',
    _clerk_org_data->>'description',
    gen_random_uuid(),
    _usr_id
  )
  ON CONFLICT (clerk_org_id) DO UPDATE SET
    org_name = COALESCE(EXCLUDED.org_name, orgs.org.org_name),
    org_desc = COALESCE(EXCLUDED.org_desc, orgs.org.org_desc),
    modified_at = NOW(),
    modified_by = _usr_id
  RETURNING org_id INTO _org_id;

  -- Ensure membership exists (upsert)
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
    true,
    COALESCE(_clerk_org_data->>'role', 'member'),
    _usr_id
  )
  ON CONFLICT (usr_id, org_id) DO UPDATE SET
    active = true,
    role = COALESCE(EXCLUDED.role, usrs.usr_org.role),
    modified_at = NOW(),
    modified_by = _usr_id
  RETURNING usr_org_id INTO _usr_org_id;

  -- Return consolidated data
  SELECT fn_get_user_org_data(
    _clerk_user_data->>'id',
    _clerk_org_data->>'id'
  ) INTO _result;

  RETURN _result;
END;
$$ LANGUAGE plpgsql;
```

#### **C. Updated App Context Function**
```sql
-- Enhanced _fn_set_app_context to use Clerk IDs
CREATE OR REPLACE FUNCTION utils._fn_set_app_context(_data JSONB)
RETURNS VOID AS $$
DECLARE
  _usr_id INTEGER;
  _org_id INTEGER;
  _clerk_user_id VARCHAR(50);
  _clerk_org_id VARCHAR(50);
BEGIN
  -- Extract Clerk IDs from data
  _clerk_user_id := _data->>'clerk_user_id';
  _clerk_org_id := _data->>'clerk_org_id';
  
  -- Validate required parameters
  IF _clerk_user_id IS NULL OR _clerk_org_id IS NULL THEN
    RAISE EXCEPTION 'clerk_user_id and clerk_org_id are required';
  END IF;
  
  -- Get internal IDs from Clerk IDs
  SELECT usr_id INTO _usr_id 
  FROM usrs.usr 
  WHERE clerk_user_id = _clerk_user_id;
  
  SELECT org_id INTO _org_id 
  FROM orgs.org 
  WHERE clerk_org_id = _clerk_org_id;
  
  -- Validate user exists
  IF _usr_id IS NULL THEN
    RAISE EXCEPTION 'User not found for clerk_user_id: %', _clerk_user_id;
  END IF;
  
  -- Validate org exists  
  IF _org_id IS NULL THEN
    RAISE EXCEPTION 'Organization not found for clerk_org_id: %', _clerk_org_id;
  END IF;
  
  -- Validate user is active member of org
  IF NOT EXISTS (
    SELECT 1 FROM usrs.usr_org 
    WHERE usr_id = _usr_id AND org_id = _org_id AND active = true
  ) THEN
    RAISE EXCEPTION 'User % is not an active member of organization %', _clerk_user_id, _clerk_org_id;
  END IF;
  
  -- Set context for RLS and other functions
  PERFORM set_config('app.usr_id', _usr_id::text, true);
  PERFORM set_config('app.org_id', _org_id::text, true);
  PERFORM set_config('app.clerk_user_id', _clerk_user_id, true);
  PERFORM set_config('app.clerk_org_id', _clerk_org_id, true);
END;
$$ LANGUAGE plpgsql;
```

### **Step 1.3: Test Database Functions**
```sql
-- Test the functions with sample data
SELECT fn_ensure_user_org_exists(
  '{"id": "user_test123", "username": "testuser", "first_name": "Test", "last_name": "User", "email": "test@example.com"}'::jsonb,
  '{"id": "org_test123", "name": "Test Organization", "description": "Test org description"}'::jsonb
);

-- Test retrieval
SELECT fn_get_user_org_data('user_test123', 'org_test123');

-- Test app context
SELECT utils._fn_set_app_context('{"clerk_user_id": "user_test123", "clerk_org_id": "org_test123"}'::jsonb);
```

---

## **PHASE 2: SERVER-SIDE AUTH INTEGRATION**

### **Step 2.1: Create Auth Utility Functions**

#### **File: `app/_lib/auth/server.js`**
```javascript
"use server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "../data/server/supabase";
import { clerkClient } from "@clerk/nextjs/server";

// Get current auth context from Clerk
export async function getAuthContext() {
  const { userId, orgId } = auth();
  
  if (!userId || !orgId) {
    redirect('/sign-in');
  }
  
  return { userId, orgId };
}

// Consolidated function to get user/org data
export async function getUserOrgData(clerkUserId, clerkOrgId) {
  const { data, error } = await supabase.rpc('fn_get_user_org_data', {
    _clerk_user_id: clerkUserId,
    _clerk_org_id: clerkOrgId
  });

  if (error) {
    console.error('Error getting user/org data:', error);
    return null;
  }

  return data;
}

// Consolidated JIT sync function
export async function ensureUserOrgExists(clerkUserId, clerkOrgId) {
  try {
    // Get Clerk data for both user and org
    const [clerkUser, clerkOrg] = await Promise.all([
      clerkClient.users.getUser(clerkUserId),
      clerkClient.organizations.getOrganization({ organizationId: clerkOrgId })
    ]);

    // Prepare data for database function
    const clerkUserData = {
      id: clerkUser.id,
      username: clerkUser.username,
      first_name: clerkUser.firstName,
      last_name: clerkUser.lastName,
      email: clerkUser.primaryEmailAddress?.emailAddress
    };

    const clerkOrgData = {
      id: clerkOrg.id,
      name: clerkOrg.name,
      description: clerkOrg.publicMetadata?.description,
      role: 'member' // Default role, can be enhanced later
    };

    // Call database function to ensure data exists
    const { data, error } = await supabase.rpc('fn_ensure_user_org_exists', {
      _clerk_user_data: clerkUserData,
      _clerk_org_data: clerkOrgData
    });

    if (error) {
      throw new Error(`Failed to ensure user/org exists: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in ensureUserOrgExists:', error);
    throw error;
  }
}

// Main function to get or create user/org data
export async function getOrCreateUserOrgData(clerkUserId, clerkOrgId) {
  // Try to get existing data first (webhook should have created it)
  let userOrgData = await getUserOrgData(clerkUserId, clerkOrgId);
  
  // Fallback to JIT sync if data doesn't exist
  if (!userOrgData) {
    console.log('User/org data not found, creating via JIT sync');
    userOrgData = await ensureUserOrgExists(clerkUserId, clerkOrgId);
  }
  
  return userOrgData;
}
```

### **Step 2.2: Update DataServices**

#### **File: `app/_lib/data/server/dataServices.js`**
```javascript
"server-only";

import { getEntityFieldMapping } from "@/app/_utils/helpers-server";
import { revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { appContextSchema } from "../../validation/buildValidationSchema";
import { supabase } from "./supabase";
import { getAuthContext, getOrCreateUserOrgData } from "../../auth/server";

export async function createDataService(globalOptions = {}) {
  // Get auth context from Clerk
  const { userId, orgId } = await getAuthContext();
  
  // Ensure user and org data exists in our database
  const userOrgData = await getOrCreateUserOrgData(userId, orgId);
  
  // Prepare data for database calls
  let _data = { 
    clerk_user_id: userId,
    clerk_org_id: orgId 
  };

  // Validate app context (update schema to use Clerk IDs)
  const validatedAppContext = await appContextSchema.safeParseAsync({
    clerk_user_id: userId,
    clerk_org_id: orgId,
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

### **Step 2.3: Update Validation Schema**

#### **File: `app/_lib/validation/buildValidationSchema.js`**
```javascript
// Update appContextSchema to use Clerk IDs
export const appContextSchema = z.object({
  clerk_user_id: z.string().min(1, { message: "Unauthorized 🚫. Invalid clerk_user_id" }),
  clerk_org_id: z.string().min(1, { message: "Unauthorized 🚫. Invalid clerk_org_id" }),
});
```

---

## **PHASE 3: CLIENT-SIDE INTEGRATION**

### **Step 3.1: Update QueryClient**

#### **File: `app/_store/queryClient.js`**
```javascript
import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        shouldRedactErrors: () => false,
      },
    },
  });
}

const orgQueryClients = new Map();

export function getQueryClient(orgId = null) {
  if (isServer || !orgId) {
    // Server: always make a new query client
    // Client without org: default client
    return makeQueryClient();
  } else {
    // Browser: get org-specific client
    if (!orgQueryClients.has(orgId)) {
      orgQueryClients.set(orgId, makeQueryClient());
    }
    return orgQueryClients.get(orgId);
  }
}

export function clearOrgQueryClient(orgId) {
  if (orgQueryClients.has(orgId)) {
    const client = orgQueryClients.get(orgId);
    client.clear();
    orgQueryClients.delete(orgId);
  }
}
```

### **Step 3.2: Update QueryProvider**

#### **File: `app/_store/QueryProvider.js`**
```javascript
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useOrganization } from "@clerk/nextjs";
import { getQueryClient } from "./queryClient";

export default function QueryProvider({ children }) {
  const { organization, isLoaded } = useOrganization();
  
  // Handle loading state
  if (!isLoaded) {
    const queryClient = getQueryClient(); // Default client during loading
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }
  
  // Get orgId from Clerk (use Clerk's org ID directly)
  const orgId = organization?.id;
  const queryClient = getQueryClient(orgId);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### **Step 3.3: Create Client Auth Hook**

#### **File: `app/_lib/auth/client.js`**
```javascript
"use client";
import { useUser, useOrganization } from "@clerk/nextjs";

export function useAuth() {
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  
  const isLoaded = userLoaded && orgLoaded;
  
  if (!isLoaded) {
    return { loading: true };
  }
  
  return {
    // Clerk IDs (used directly)
    clerkUserId: user?.id,
    clerkOrgId: organization?.id,
    
    // User info
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.primaryEmailAddress?.emailAddress,
    
    // Organization info
    orgName: organization?.name,
    userRole: organization?.membership?.role,
    
    // Auth state
    isAuthenticated: !!user,
    hasOrganization: !!organization,
    loading: false
  };
}
```

---

## **PHASE 4: ORGANIZATION SWITCHING**

### **Step 4.1: Create Organization Switcher**

#### **File: `app/_components/OrganizationSwitcher.js`**
```javascript
"use client";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { clearOrgQueryClient } from "@/app/_store/queryClient";
import toast from "react-hot-toast";

export default function OrganizationSwitcher() {
  const { organization } = useOrganization();
  const { organizationList, setActive } = useOrganizationList();
  const router = useRouter();
  const queryClient = useQueryClient();

  const switchToOrg = async (newOrgId) => {
    try {
      // Clear current org's query cache
      if (organization?.id) {
        clearOrgQueryClient(organization.id);
      }
      
      // Clear current query client
      queryClient.clear();
      
      // Switch to new organization
      await setActive({ organization: newOrgId });
      
      // Redirect to home for fresh start
      router.push('/');
      
      toast.success('Organization switched successfully');
    } catch (error) {
      console.error('Error switching organization:', error);
      toast.error('Failed to switch organization');
    }
  };

  return (
    <div className="relative">
      <select 
        value={organization?.id || ''} 
        onChange={(e) => switchToOrg(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm"
      >
        <option value="">Select Organization</option>
        {organizationList?.map((org) => (
          <option key={org.organization.id} value={org.organization.id}>
            {org.organization.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

## **PHASE 5: TESTING & VALIDATION**

### **Step 5.1: Create Test Script**

#### **File: `scripts/test-auth-integration.js`**
```javascript
// Test script to validate the integration
import { createDataService } from '../app/_lib/data/server/dataServices.js';

async function testAuthIntegration() {
  try {
    console.log('Testing auth integration...');
    
    // Test data service creation
    const dataService = await createDataService();
    console.log('✅ DataService created successfully');
    
    // Test getting items
    const items = await dataService.getItems({ id: 'all' });
    console.log('✅ Items retrieved:', items.length);
    
    // Test other entities
    const locations = await dataService.getLocations({ id: 'all' });
    console.log('✅ Locations retrieved:', locations.length);
    
    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuthIntegration();
```

### **Step 5.2: Manual Testing Checklist**

- [ ] User can sign in with Clerk
- [ ] User can create/join organization
- [ ] User/org data syncs to database via JIT
- [ ] Database functions work with Clerk IDs
- [ ] QueryClient isolation works per org
- [ ] Organization switching redirects to home
- [ ] All existing functionality works
- [ ] Performance is acceptable

---

## **PHASE 6: CLEANUP & OPTIMIZATION**

### **Step 6.1: Remove Old Auth Code**

#### **Files to Remove/Update:**
- [ ] Remove `app/_hooks/useAuth.js` (old hardcoded version)
- [ ] Update all imports to use new auth functions
- [ ] Remove UUID-based mapping logic (keep UUIDs for backward compatibility)
- [ ] Update any hardcoded org/user UUIDs in tests

### **Step 6.2: Performance Optimization**

#### **Add Caching for User/Org Lookups:**
```javascript
// Add caching to reduce database calls
import { cache } from 'react';

export const getCachedUserOrgData = cache(async (clerkUserId, clerkOrgId) => {
  return await getUserOrgData(clerkUserId, clerkOrgId);
});
```

### **Step 6.3: Error Handling Enhancement**

#### **Add Comprehensive Error Handling:**
```javascript
// Enhanced error handling for auth failures
export async function createDataService(globalOptions = {}) {
  try {
    const { userId, orgId } = await getAuthContext();
    const userOrgData = await getOrCreateUserOrgData(userId, orgId);
    
    // Continue with data service creation...
  } catch (error) {
    if (error.message.includes('not found')) {
      // Handle user/org not found
      redirect('/onboarding');
    } else if (error.message.includes('not a member')) {
      // Handle membership issues
      redirect('/unauthorized');
    } else {
      // Handle other errors
      throw error;
    }
  }
}
```

---

## **PHASE 7: FUTURE WEBHOOK INTEGRATION**

### **Step 7.1: Webhook Endpoint Preparation**

#### **File: `app/api/webhooks/clerk/route.js`**
```javascript
// Placeholder for future webhook implementation
export async function POST(req) {
  const { type, data } = await req.json();
  
  // TODO: Implement webhook handlers
  // - user.created
  // - user.updated  
  // - organization.created
  // - organization.updated
  // - organizationMembership.created
  // - organizationMembership.deleted
  
  return new Response('OK', { status: 200 });
}
```

### **Step 7.2: Webhook Integration Plan**

When ready to implement webhooks:
1. Implement webhook handlers for real-time sync
2. Update JIT functions to be fallback only
3. Add webhook failure recovery mechanisms
4. Monitor sync accuracy and performance

---

## **IMPLEMENTATION TIMELINE**

### **Week 1: Database & Server Setup**
- **Days 1-2**: Phase 1 (Database preparation)
- **Days 3-4**: Phase 2 (Server-side integration)
- **Day 5**: Testing database functions

### **Week 2: Client Integration & Testing**
- **Days 1-2**: Phase 3 (Client-side integration)
- **Days 3-4**: Phase 4 (Organization switching)
- **Day 5**: Phase 5 (Testing & validation)

### **Week 3: Cleanup & Optimization**
- **Days 1-2**: Phase 6 (Cleanup & optimization)
- **Days 3-5**: Performance testing and bug fixes

### **Future**: Webhook Integration (Phase 7)

---

## **SUCCESS CRITERIA**

- [ ] All existing functionality works with Clerk authentication
- [ ] Organization switching works smoothly with redirect approach
- [ ] Database performance is maintained or improved
- [ ] Code complexity is reduced compared to current implementation
- [ ] System is ready for future webhook integration
- [ ] Comprehensive error handling is in place
- [ ] Documentation is updated for team onboarding

---

**Document Status**: Implementation Guide  
**Created**: January 2025  
**Priority**: High  
**Estimated Effort**: 3 weeks  
**Dependencies**: Clerk setup, Database access