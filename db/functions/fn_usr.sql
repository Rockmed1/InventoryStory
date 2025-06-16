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

CREATE OR REPLACE FUNCTION utils._fn_get_usr_id(_usr_uuid UUID)
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
		u.usr_uuid = _usr_uuid;
	IF _usr_id IS NULL THEN
		RAISE EXCEPTION 'usr_id is unexpectedly NULL for UUID %' , _usr_uuid;
	END IF;
	RETURN _usr_id;
EXCEPTION
	WHEN NO_DATA_FOUND THEN
		RAISE EXCEPTION 'User % not found.' , _usr_uuid;
	WHEN TOO_MANY_ROWS THEN
		RAISE EXCEPTION 'User % not unique. Contact system admin.' , _usr_uuid;
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
	_org_uuid UUID := NULL;
	_success BOOLEAN := FALSE;
BEGIN
	--verify input parameters:
	PERFORM
		_fn_assert_input_keys_param(_data , ARRAY['_org_name' , '_usr_uuid']);
	--validate organization does not exist
	PERFORM
		_fn_assert_org_not_exist(_data ->> '_org_name');
	--get usr_id
	_usr_id := _fn_get_usr_id((_data ->> '_usr_uuid')::UUID);
	--create organization
	INSERT INTO orgs.org(
		org_name
		, created_by)
	VALUES (
		_data ->> '_org_name'
		, _usr_id)
RETURNING
	org_id
	, org_uuid INTO _org_id
	, _org_uuid;
	-- assign usr to organization
	IF (FOUND AND _fn_assign_usr_org(_usr_id , _org_id)) THEN
		_success := TRUE;
	END IF;
	RETURN json_build_object('org_uuid' , _org_uuid , 'success' , _success);
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

CREATE OR REPLACE FUNCTION utils.fn_get_usr_orgs(_usr_uuid UUID)
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
			a.usr_uuid
			, a.usr_name
			, json_agg(json_build_object('org_uuid' , a.org_uuid , 'org_name' , a.org_name)) AS orgs
		FROM
			usrs.v_usr_org a
		WHERE
			a.usr_uuid = _usr_uuid
		GROUP BY
			a.usr_uuid
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

CREATE OR REPLACE FUNCTION utils._fn_get_org_id(_org_uuid UUID)
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
		o.org_uuid = _org_uuid;
	IF _org_id IS NULL THEN
		RAISE EXCEPTION 'org_id is unexpectedly NULL for UUID %' , _org_uuid;
	END IF;
	RETURN _org_id;
EXCEPTION
	WHEN NO_DATA_FOUND THEN
		RAISE EXCEPTION 'Organization % not found.' , _org_uuid;
	WHEN TOO_MANY_ROWS THEN
		RAISE EXCEPTION 'Organization % not unique. Contact system admin.' , _org_uuid;
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_get_org_id OWNER TO utils_admin;
