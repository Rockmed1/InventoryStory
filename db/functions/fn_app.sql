RESET ROLE;

SELECT
	"current_user"();

----------
-------
-----
----
--
--## _fn_assert_usr_org_auth: usr_id, org_id =>void raises error if not authorized
DROP FUNCTION IF EXISTS utils._fn_assert_usr_org_auth;

CREATE OR REPLACE FUNCTION utils._fn_assert_usr_org_auth(IN _usr_id INTEGER , IN _org_id INTEGER)
	RETURNS VOID
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
BEGIN
	PERFORM
		1
	FROM
		usrs.usr_org u
	WHERE
		u.usr_id = _usr_id
		AND u.org_id = _org_id;
	IF NOT FOUND THEN
		RAISE EXCEPTION 'The user is not authorized in this organization.';
	END IF;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_assert_usr_org_auth OWNER TO utils_admin;

---------
-----
----
--
--
/* ## _fn_set_org_rls */
DROP FUNCTION IF EXISTS utils._fn_set_org_rls(IN _org_id INTEGER);

CREATE OR REPLACE FUNCTION utils._fn_set_org_rls(IN _org_id INTEGER)
	RETURNS BOOLEAN
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
BEGIN
	PERFORM
		SET_CONFIG('rls.org_id' , _org_id::TEXT , TRUE);
	IF CURRENT_SETTING('rls.org_id' , TRUE) IS NULL THEN
		RAISE EXCEPTION 'Failed to set rls.org_id session variable';
		RETURN FALSE;
	ELSE
		RETURN TRUE;
	END IF;
END;

$$;

ALTER FUNCTION utils._fn_set_org_rls OWNER TO utils_admin;

-------
------------
----------
-----
DROP FUNCTION IF EXISTS utils._fn_assert_input_keys_param;

CREATE OR REPLACE FUNCTION utils._fn_assert_input_keys_param(IN _data JSONB , IN _keys_param TEXT[] , _fn_name TEXT DEFAULT '')
	RETURNS void
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
BEGIN
	--! Assert logic here
	-- verify input parameters:
	IF array_length(_keys_param , 1) IS NULL THEN
		RAISE EXCEPTION '% _keys_param cannot be empty array or null in a record function.' , _fn_name;
	END IF;
	IF NOT(_data ?& _keys_param) THEN
		RAISE EXCEPTION 'Invalid function parameters contained in the % _data JSONB. _keys_param: %' , _fn_name , _keys_param;
	END IF;

EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_assert_input_keys_param OWNER TO utils_admin;

------------
---------
------
----
---
--/*##  _fn_set_app_context */
DROP FUNCTION IF EXISTS utils._fn_set_app_context;

CREATE OR REPLACE FUNCTION utils._fn_set_app_context(IN _data JSONB , IN _keys_param TEXT[] DEFAULT NULL , _fn_name TEXT DEFAULT '' , _option TEXT DEFAULT 'record')
	RETURNS TABLE(
		_usr_id INTEGER
		, _org_id INTEGER
		, _is_context_set BOOLEAN)
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
BEGIN
	_is_context_set := FALSE;
	-- option should be record or trans
	IF _option NOT IN('record' , 'trans') THEN
		RAISE EXCEPTION 'Invalid context option: %, must be one of record or trans' , _option;
	END IF;
	-- _keys_param should not be null or empty array for 'record'
	IF _option = 'record' AND(_keys_param IS NULL OR array_length(_keys_param , 1) IS NULL) THEN
		RAISE EXCEPTION '_keys_param cannot be null or empty array in a record function.';
	END IF;
	--verify level 1 input parameters:
	PERFORM
		_fn_assert_input_keys_param(_data , _keys_param , _fn_name);
	--get user id
	SELECT
		_fn_get_usr_id((_data ->> '_usr_uuid')::UUID) INTO _usr_id;
	--get org_id
	SELECT
		_fn_get_org_id((_data ->> '_org_uuid')::UUID) INTO _org_id;
	--confirm user is authorized in organization
	PERFORM
		_fn_assert_usr_org_auth(_usr_id , _org_id);
	--set rls for org_id
	IF _fn_set_org_rls(_org_id) THEN
		_is_context_set := TRUE;
	END IF;
	IF _option = 'trans' THEN
		-- validating trx input requires org context in place
		PERFORM
			_fn_assert_valid_item_trx_input(_data);
	END IF;
	RAISE NOTICE 'current db_session_user: %' , CURRENT_USER;
	RAISE NOTICE 'current rls.org_id: %' , CURRENT_SETTING('rls.org_id' , TRUE);
	RAISE NOTICE '_usr_id: %' , _usr_id;
	RAISE NOTICE '_org_id: %' , _org_id;
	RAISE NOTICE '_is_context_set: %' , UPPER(_is_context_set::TEXT);
	RETURN QUERY
	SELECT
		_usr_id
		, _org_id
		, _is_context_set;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_set_app_context OWNER TO utils_admin;

--------------
---------
-------
-----
---
--
