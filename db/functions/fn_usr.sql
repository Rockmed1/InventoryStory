RESET ROLE;

SELECT
	"current_user"();

--
-----
--## _fn_assert_usr_not_exist: usr_name text => bool
DROP FUNCTION IF EXISTS utils._fn_assert_usr_not_exist;

CREATE OR REPLACE FUNCTION utils._fn_assert_usr_not_exist(IN _usr_name TEXT)
	RETURNS void
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
BEGIN
	PERFORM
		1
	FROM
		usrs.usr u
	WHERE
		u.usr_name = _usr_name;
	IF FOUND THEN
		RAISE EXCEPTION 'User name % already exists.' , _usr_name;
	END IF;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_assert_usr_not_exist OWNER TO utils_admin;

-------------
--------
------
----
---
--
-- ##  _fn_assert_org_not_exist :org_name => void - raises error if exists
DROP FUNCTION IF EXISTS utils._fn_assert_org_not_exist;

CREATE OR REPLACE FUNCTION utils._fn_assert_org_not_exist(IN _org_name TEXT)
	RETURNS void
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
BEGIN
	PERFORM
		1
	FROM
		orgs.org o
	WHERE
		o.org_name = _org_name;
	IF FOUND THEN
		RAISE EXCEPTION 'Organization name % already exists.' , _org_name;
	END IF;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_assert_org_not_exist OWNER TO utils_admin;

-------------
---------
-----
---
--
/* ## fn_create_usr */
DROP FUNCTION IF EXISTS utils.fn_create_usr;

CREATE OR REPLACE FUNCTION utils.fn_create_usr(_data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_uuid UUID := NULL;
	_success BOOLEAN := FALSE;
BEGIN
	--verify input parameters:
	PERFORM
		_fn_assert_input_keys_param(_data , ARRAY['_usr_name' , '_first_name' , '_last_name' , '_email']);
	--validate if user already exists
	PERFORM
		_fn_assert_usr_not_exist((_data ->> '_usr_name')::TEXT);
	--create usr
	INSERT INTO usrs.usr(
		usr_name
		, first_name
		, last_name
		, email)
	VALUES (
		_data ->> '_usr_name'
		, _data ->> '_first_name'
		, _data ->> '_last_name'
		, _data ->> '_email')
RETURNING
	usr_uuid INTO _usr_uuid;
	IF NOT FOUND THEN
		RAISE EXCEPTION 'User % could not be created.' , _data ->> '_usr_name';
	END IF;
	_success := TRUE;

	RETURN json_build_object('usr_uuid' , _usr_uuid , 'success' , _success);

EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_create_usr OWNER TO utils_admin;

--------
-----
---
--
-- ## fn_get_usr_uuid :usr_name =>usr_uuid
DROP FUNCTION IF EXISTS utils.fn_get_usr_uuid;

CREATE OR REPLACE FUNCTION utils.fn_get_usr_uuid(IN _usr_name VARCHAR(20))
	RETURNS UUID
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_uuid UUID;
BEGIN
	SELECT
		usr_uuid INTO _usr_uuid
	FROM
		usrs.usr
	WHERE
		usr_name = _usr_name;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'User % is not found.' , _usr_name;
	END IF;

	RETURN _usr_uuid;

EXCEPTION
	WHEN OTHERS THEN
		RAISE;
		--RAISE EXCEPTION 'Operation failed: %' , SQLERRM;
END;

$$;

ALTER FUNCTION utils.fn_get_usr_uuid OWNER TO utils_admin;

--------
------
-----
---
--
--/* ## fn_get_usr_id */
DROP FUNCTION IF EXISTS utils._fn_get_usr_id;

CREATE OR REPLACE FUNCTION utils._fn_get_usr_id(_usr_xid VARCHAR(50))
	RETURNS INT
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
BEGIN
	SELECT
		u.usr_id INTO STRICT _usr_id
	FROM
		usrs.usr u
	WHERE
		u.usr_xid = _usr_xid;
	IF _usr_id IS NULL THEN
		RAISE EXCEPTION 'usr_id is unexpectedly NULL for xId %' , _usr_xid;
	END IF;
	RETURN _usr_id;
EXCEPTION
	WHEN NO_DATA_FOUND THEN
		RAISE EXCEPTION 'User % not found.' , _usr_xid;
	WHEN TOO_MANY_ROWS THEN
		RAISE EXCEPTION 'User % not unique. Contact system admin.' , _usr_xid;
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_get_usr_id OWNER TO utils_admin;

----------
-------
-----
---
--
/* ## fn_assert_usr_org_not_exist */
DROP FUNCTION IF EXISTS utils._fn_assert_usr_org_not_exist;

CREATE OR REPLACE FUNCTION utils._fn_assert_usr_org_not_exist(IN _usr_id INTEGER , IN _org_id INTEGER)
	RETURNS VOID
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
BEGIN
	PERFORM
		1
	FROM
		usrs.usr_org uo
	WHERE
		uo.usr_id = _usr_id
		AND uo.org_id = _org_id;
	IF FOUND THEN
		RAISE EXCEPTION 'The user is already assigned to the organization';
	END IF;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_assert_usr_org_not_exist OWNER TO utils_admin;

-------------------
-------------
---------
-------
----
--
-- ## _fn_assign_usr_org :usr_id,org_id =>success bool
CREATE OR REPLACE FUNCTION utils._fn_assign_usr_org(IN _usr_id INTEGER , IN _org_id INTEGER)
	RETURNS BOOLEAN
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
BEGIN
	--validate if the assignment is already done
	PERFORM
		_fn_assert_usr_org_not_exist(_usr_id , _org_id);
	-- INSERT INTo user organization assignment table
	INSERT INTO usrs.usr_org(
		usr_id
		, org_id
		, created_by)
	VALUES(
		_usr_id
		, _org_id
		, _usr_id);
	IF NOT FOUND THEN
		RAISE EXCEPTION 'User cannot be assigned to Organization.';
	END IF;
	RETURN TRUE;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
		RETURN FALSE;
END;

$$;

ALTER FUNCTION utils._fn_assign_usr_org OWNER TO utils_admin;

-----------
-------
-----
---
-----
--## fn_create_organization : object of usr_uuid, org_name,...etc. => table of org_uuid, org_name (needs to call _fn_assign_usr_org)
DROP FUNCTION IF EXISTS utils.fn_create_organization;

CREATE OR REPLACE FUNCTION utils.fn_create_organization(_data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_org_xid VARCHAR(50) := NULL;
	_success BOOLEAN := FALSE;
BEGIN
	--verify input parameters:
	PERFORM
		_fn_assert_input_keys_param(_data , ARRAY['_org_name' , '_usr_xid']);
	--validate organization does not exist
	PERFORM
		_fn_assert_org_not_exist(_data ->> '_org_name');
	--get usr_id
	_usr_id := _fn_get_usr_id((_data ->> '_usr_xid'));
	--create organization
	INSERT INTO orgs.org(
		org_name
		, created_by)
	VALUES (
		_data ->> '_org_name'
		, _usr_id)
RETURNING
	org_id
	, org_xid INTO _org_id
	, _org_xid;
	-- assign usr to organization
	IF (FOUND AND _fn_assign_usr_org(_usr_id , _org_id)) THEN
		_success := TRUE;
	END IF;
	RETURN json_build_object('org_xid' , _org_xid , 'success' , _success);
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_create_organization OWNER TO utils_admin;

-------------
----------
-----
-----
---
--/* ## fn_get_usr_orgs */
DROP FUNCTION IF EXISTS utils.fn_get_usr_orgs;

CREATE OR REPLACE FUNCTION utils.fn_get_usr_orgs(_usr_xid UUID)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_result JSON;
BEGIN
	SELECT
		to_json(_data) INTO _result
	FROM (
		SELECT
			a.usr_xid
			, a.usr_name
			, json_agg(json_build_object('org_xid' , a.org_xid , 'org_name' , a.org_name)) AS orgs
		FROM
			usrs.v_usr_org a
		WHERE
			a.usr_xid = _usr_xid
		GROUP BY
			a.usr_xid
			, a.usr_name) AS _data;
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

---
-------
------
-----
---
--/* ## fn_get_org_id */ :org_uuid =>org_id
DROP FUNCTION IF EXISTS utils._fn_get_org_id;

CREATE OR REPLACE FUNCTION utils._fn_get_org_id(_org_xid VARCHAR(50))
	RETURNS INT
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_org_id INTEGER;
BEGIN
	SELECT
		o.org_id INTO STRICT _org_id
	FROM
		orgs.org o
	WHERE
		o.org_xid = _org_xid;
	IF _org_id IS NULL THEN
		RAISE EXCEPTION 'org_id is unexpectedly NULL for UUID %' , _org_xid;
	END IF;
	RETURN _org_id;
EXCEPTION
	WHEN NO_DATA_FOUND THEN
		RAISE EXCEPTION 'Organization % not found.' , _org_xid;
	WHEN TOO_MANY_ROWS THEN
		RAISE EXCEPTION 'Organization % not unique. Contact system admin.' , _org_xid;
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_get_org_id OWNER TO utils_admin;

----------------
------------
---------
------
----
---
--
------------
----------
--------
------
---
/* ## fn_sync_x_usr */
DROP FUNCTION IF EXISTS utils.fn_sync_x_usr;

CREATE OR REPLACE FUNCTION utils.fn_sync_x_usr(IN _data JSONB)
	RETURNS INTEGER
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INT;
BEGIN
	-- UPSERT user (no UUIDs)
	INSERT INTO usrs.usr(
		usr_xid
		, usr_name
		, first_name
		, last_name
		, email
		, created_by)
	VALUES (
		_data ->> '_usr_xid'
		, COALESCE(
			_data ->> '_usr_name' , _data ->> '_email')
		, _data ->> '_first_name'
		, _data ->> '_last_name'
		, _data ->> '_email'
		, 1000 -- System user for JIT creation
)
ON CONFLICT (
	usr_xid)
	DO UPDATE SET
		usr_name = COALESCE(EXCLUDED.usr_name , usrs.usr.usr_name)
		, first_name = COALESCE(EXCLUDED.first_name , usrs.usr.first_name)
		, last_name = COALESCE(EXCLUDED.last_name , usrs.usr.last_name)
		, email = COALESCE(EXCLUDED.email , usrs.usr.email)
		, modified_at = NOW()
		, modified_by = 1000
	RETURNING
		usr_id INTO _usr_id;
	RETURN _usr_id;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_sync_x_usr OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_sync_x_org */
DROP FUNCTION IF EXISTS utils.fn_sync_x_org;

CREATE OR REPLACE FUNCTION utils.fn_sync_x_org(IN _data JSONB)
	RETURNS INTEGER
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_org_id INT;
BEGIN
	-- UPSERT organization
	INSERT INTO orgs.org(
		org_xid
		, org_name
		, org_desc
		, created_by)
	VALUES (
		_data ->> '_org_xid'
		, _data ->> '_org_name'
		, _data ->> '_org_desc'
		, 1000 -- System user for JIT creation
)
ON CONFLICT (
	org_xid)
	DO UPDATE SET
		org_name = COALESCE(EXCLUDED.org_name , orgs.org.org_name)
		, org_desc = COALESCE(EXCLUDED.org_desc , orgs.org.org_desc)
		, modified_at = NOW()
		, modified_by = 1000 -- System user for JIT creation
	RETURNING
		org_id INTO _org_id;
	RETURN _org_id;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_sync_x_org OWNER TO utils_admin;

-----------------
--------------
----------
-------
----
---
--
DROP FUNCTION IF EXISTS utils._fn_assert_x_org_exists;

CREATE OR REPLACE FUNCTION utils._fn_assert_x_org_exists(IN _data TEXT[])
	RETURNS void
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_missing_org_xids TEXT[];
BEGIN
	--! Assert logic here
	WITH input_clerk_orgs AS (
		SELECT
			unnest(_data) AS _org_xid
)
, missing_orgs AS (
	SELECT
		x._org_xid
	FROM
		input_clerk_orgs x
		LEFT JOIN orgs.org o ON o.org_xid = x._org_xid
	WHERE
		o.org_id IS NULL
)
SELECT
	array_agg(_org_xid) INTO _missing_org_xids
FROM
	missing_orgs;

	IF _missing_org_xids IS NOT NULL THEN
		RAISE EXCEPTION 'The following Clerk organization Ids were not found : %' , _missing_org_xids;
	END IF;

EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_assert_x_org_exists OWNER TO utils_admin;

----------
-------
----
---
--
DROP FUNCTION IF EXISTS utils.fn_sync_x_usr_org;

CREATE OR REPLACE FUNCTION utils.fn_sync_x_usr_org(_data JSONB)
	RETURNS JSONB
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_clerk_usr_data JSONB;
	_clerk_org_data JSONB;
	_clerk_usr_org_data TEXT[];
	_usr_id INTEGER;
	_org_id INTEGER;
	_mapped_org_ids INTEGER[];
	_result JSONB;
BEGIN
	-- Extract nested JSONB data
	_clerk_usr_data := _data -> '_clerk_usr_data';
	_clerk_org_data := _data -> '_clerk_org_data';
	_clerk_usr_org_data := ARRAY (
		SELECT
			jsonb_array_elements_text(_data -> '_clerk_usr_org_data'));
	-- UPSERT user (no UUIDs)
	SELECT
		fn_sync_x_usr(_clerk_usr_data) INTO _usr_id;
	-- UPSERT organization (no UUIDs)
	SELECT
		fn_sync_x_org(_clerk_org_data) INTO _org_id;
	-- UPSERT user-org membership (handles assignment/unassignment)
	-- Step 1: Find ,if any, which Clerk org IDs don't exist in the DB
	PERFORM
		_fn_assert_x_org_exists(_clerk_usr_org_data);
	--
	--step 2: Map valid Clerk org ids to db org_id:
	SELECT
		array_agg(o.org_id) INTO _mapped_org_ids
	FROM
		orgs.org o
	WHERE
	-- org_xid  IN _clerk_usr_org_data;
	org_xid = ANY (_clerk_usr_org_data);
	--
	--step 3: Upsert active memberships:
	INSERT INTO usrs.usr_org(
		usr_id
		, org_id
		, active
		-- , role
		, created_by)
	SELECT
		_usr_id
		, x._org_id
		, TRUE -- true for assignment, false for unassignment
		-- COALESCE(
		-- _clerk_org_data ->> 'role' , 'member')
		, 1000 -- System user for JIT creation
	FROM (
		SELECT
			unnest(_mapped_org_ids) AS _org_id) AS x
ON CONFLICT (usr_id
	, org_id)
	DO UPDATE SET
		active = TRUE -- Update active status
		, modified_at = NOW()
		, modified_by = 1000;
	--
	--step 4: Deactivate any other current org membership:
	-- Update rows in 'usrs.usr_org' where condition is met
	UPDATE
		usrs.usr_org
	SET
		active = FALSE
		, modified_at = NOW()
	WHERE
		usr_id = _usr_id
		AND org_id NOT IN (
			SELECT
				unnest(_mapped_org_ids));
	--
	-- step 5: SUCCESSFUL
	SELECT
		jsonb_build_object('success' , TRUE , 'message' , format('% & organization(s) synced successfully' , _clerk_usr_data ->> '_usr_xid')) INTO _result;

	RETURN _result;

EXCEPTION
	WHEN OTHERS THEN
		-- Return error details
		RETURN jsonb_build_object('success' , FALSE , 'message' , SQLERRM , 'error_code' , SQLSTATE);
END;

$$;

ALTER FUNCTION utils.fn_sync_x_usr_org OWNER TO utils_admin;
