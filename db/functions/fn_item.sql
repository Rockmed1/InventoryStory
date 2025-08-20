RESET ROLE;

SELECT
	"current_user"();

-----------
--------
------
----
--
--## fn_create_item_class : item_class_name text, item_class_desc text
DROP FUNCTION IF EXISTS utils.fn_create_item_class;

CREATE OR REPLACE FUNCTION utils.fn_create_item_class(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_item_class_name' , '_item_class_desc'];
	_is_context_set BOOLEAN;
	_success BOOLEAN := FALSE;
BEGIN
	--set org context and get usr_id, org_id :
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_create_item_class');
	--if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--!Main Action Here
	INSERT INTO items.item_class(
		item_class_name
		, item_class_desc
		, created_by
		, org_id)
	VALUES (
		_data ->> '_item_class_name'
		, _data ->> '_item_class_desc'
		, _usr_id
		, _org_id)
RETURNING
	TRUE INTO _success;
	IF NOT _success THEN
		RAISE EXCEPTION 'Item class could not be added.';
	END IF;
	RETURN json_build_object('success' , _success);
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_create_item_class OWNER TO utils_admin;

------------
----------
--------
------
---
/*##  fn_get_items_classes */
DROP FUNCTION IF EXISTS utils.fn_get_items_classes;

CREATE OR REPLACE FUNCTION utils.fn_get_items_classes(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_item_class_id'];
	_is_context_set BOOLEAN;
	_result JSON;
BEGIN
	--set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_get_items_classes');
	--if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--!Main Action Here
	SELECT
		INTO _result json_agg(json_build_object('idField' , ic.item_class_id , 'nameField' , ic.item_class_name , 'descField' , ic.item_class_desc))
	FROM
		items.v_item_class ic
	WHERE (_data ->> '_item_class_id' IS NULL)
		OR ic.item_class_id =(_data ->> '_item_class_id')::INTEGER;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'No item classes available in this Organization.';

	END IF;
	RETURN _result;

EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_get_items_classes OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_update_item_class */
DROP FUNCTION IF EXISTS utils.fn_update_item_class;

CREATE OR REPLACE FUNCTION utils.fn_update_item_class(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_item_class_id' , '_item_class_name' , '_item_class_desc'];
	_is_context_set BOOLEAN;
	_rows_affected INTEGER;
	_updated_item_class_id INTEGER;
	_success BOOLEAN := FALSE;
	_result_data JSON;
BEGIN
	-- verify input parameters and set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_update_item_class');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	UPDATE
		items.item_class ic
	SET
		item_class_name = _data ->> '_item_class_name'
		, item_class_desc = _data ->> '_item_class_desc'
	WHERE
		ic.item_class_id =(_data ->> '_item_class_id')::INTEGER
	RETURNING
		item_class_id INTO _updated_item_class_id;
	GET DIAGNOSTICS _rows_affected = ROW_COUNT;

	IF _rows_affected = 0 THEN
		RAISE EXCEPTION 'Item Class with ID % not found or you do not have permission to update it.' ,(_data ->> '_item_class_id');
	END IF;

	SELECT
		INTO _result_data json_build_object('idField' , ic.item_class_id , 'nameField' , ic.item_class_name , 'descField' , ic.item_class_desc)
	FROM
		items.v_item_class ic
	WHERE
		ic.item_class_id = _updated_item_class_id;

	_success := TRUE;

	RETURN json_build_object('success' , _success , 'data' , _result_data , 'message' , 'Item class updated successfully');
EXCEPTION
	WHEN OTHERS THEN
		RETURN json_build_object('success' , FALSE , 'error' , json_build_object('code' , SQLSTATE , 'message' , SQLERRM , 'function' , 'fn_update_item_class'));
END;

$$;

ALTER FUNCTION utils.fn_update_item_class OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_create_location */
DROP FUNCTION IF EXISTS utils.fn_create_location;

CREATE OR REPLACE FUNCTION utils.fn_create_location(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_loc_name' , '_loc_desc'];
	_is_context_set BOOLEAN;
	_success BOOLEAN := FALSE;
BEGIN
	--
	-- verify input parameters and set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_create_location');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	INSERT INTO locations.location(
		loc_name
		, loc_desc
		, created_by
		, org_id)
	VALUES (
		_data ->> '_loc_name'
		, _data ->> '_loc_desc'
		, _usr_id
		, _org_id)
RETURNING
	TRUE INTO _success;

	IF NOT _success THEN
		RAISE EXCEPTION 'Location could not be added.';
	END IF;

	RETURN json_build_object('success' , _success);
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_create_location OWNER TO utils_admin;

------------
----------
--------
------
---
/*##  fn_get_locations */
DROP FUNCTION IF EXISTS utils.fn_get_get_locations;

CREATE OR REPLACE FUNCTION utils.fn_get_locations(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_loc_id'];
	_is_context_set BOOLEAN;
	_result JSON;
BEGIN
	-- verify input parameters:
	-- set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_get_locations');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	SELECT
		INTO _result json_agg(json_build_object('idField' , t.loc_id , 'nameField' , t.loc_name , 'descField' , t.loc_desc))
	FROM
		locations.v_location t
	WHERE (_data ->> '_loc_id' IS NULL)
		OR t.loc_id =(_data ->> '_loc_id')::INTEGER;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'No records found in locations.location.';
	END IF;

	RETURN _result;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_get_locations OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_update_location */
DROP FUNCTION IF EXISTS utils.fn_update_location;

CREATE OR REPLACE FUNCTION utils.fn_update_location(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_loc_id' , '_loc_name' , '_loc_desc'];
	_rows_affected INTEGER;
	_is_context_set BOOLEAN;
	_updated_loc_id INTEGER;
	_success BOOLEAN := FALSE;
	_result_data JSON;
BEGIN
	--
	-- verify input parameters and set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_update_location');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	UPDATE
		locations.location l
	SET
		loc_name = _data ->> '_loc_name'
		, loc_desc = _data ->> '_loc_desc'
	WHERE
		l.loc_id =(_data ->> '_loc_id')::INTEGER
	RETURNING
		loc_id INTO _updated_loc_id;
	GET DIAGNOSTICS _rows_affected = ROW_COUNT;

	IF _rows_affected = 0 THEN
		RAISE EXCEPTION 'Location with ID % not found or you do not have permission to update it.' ,(_data ->> '_loc_id');
	END IF;

	SELECT
		INTO _result_data json_build_object('idField' , l.loc_id , 'nameField' , l.loc_name , 'descField' , l.loc_desc)
	FROM
		locations.v_location l
	WHERE
		l.loc_id = _updated_loc_id;

	_success := TRUE;

	RETURN json_build_object('success' , _success , 'data' , _result_data , 'message' , 'Location updated successfully');
EXCEPTION
	WHEN OTHERS THEN
		RETURN json_build_object('success' , FALSE , 'error' , json_build_object('code' , SQLSTATE , 'message' , SQLERRM , 'function' , 'fn_update_location'));
END;

$$;

ALTER FUNCTION utils.fn_update_location OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_create_bins */
DROP FUNCTION IF EXISTS utils.fn_create_bin;

CREATE OR REPLACE FUNCTION utils.fn_create_bin(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_bin_name' , '_bin_desc' , '_loc_id'];
	_is_context_set BOOLEAN;
	_success BOOLEAN := FALSE;
BEGIN
	-- verify input parameters:
	-- set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_create_bin');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	INSERT INTO locations.bin(
		bin_name
		, bin_desc
		, loc_id
		, created_by
		, org_id)
	VALUES (
		_data ->> '_bin_name'
		, _data ->> '_bin_desc'
		,(
			_data ->> '_loc_id') ::INT
		, _usr_id
		, _org_id)
RETURNING
	TRUE INTO _success;

	IF NOT _success THEN
		RAISE EXCEPTION 'Bin could not be added.';
	END IF;

	RETURN json_build_object('success' , _success);
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_create_bin OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_get_bins */
DROP FUNCTION IF EXISTS utils.fn_get_bins;

CREATE OR REPLACE FUNCTION utils.fn_get_bins(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_bin_id'];
	_is_context_set BOOLEAN;
	_result JSON;
BEGIN
	-- verify input parameters:
	-- set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_get_bins');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	SELECT
		INTO _result json_agg(json_build_object('idField' , b.bin_id , 'nameField' , b.bin_name , 'locationId' , b.loc_id , 'locationName' , b.loc_name , 'descField' , b.bin_desc))
	FROM
		locations.v_bin b
	WHERE (_data ->> '_bin_id' IS NULL)
		OR b.bin_id =(_data ->> '_bin_id')::INTEGER;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'No records found in locations.bin.';
	END IF;

	RETURN _result;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_get_bins OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_update_bin */
DROP FUNCTION IF EXISTS utils.fn_update_bin;

CREATE OR REPLACE FUNCTION utils.fn_update_bin(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_bin_id' , '_bin_name' , '_bin_desc' , '_loc_id'];
	_is_context_set BOOLEAN;
	_rows_affected INTEGER;
	_updated_bin_id INTEGER;
	_success BOOLEAN := FALSE;
	_result_data JSON;
BEGIN
	-- verify input parameters and set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_update_bin');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';

	END IF;
	--! Main Action Here
	UPDATE
		locations.bin b
	SET
		bin_name = _data ->> '_bin_name'
		, bin_desc = _data ->> '_bin_desc'
		, loc_id =(_data ->> '_loc_id')::INTEGER
	WHERE
		b.bin_id =(_data ->> '_bin_id')::INTEGER
	RETURNING
		bin_id INTO _updated_bin_id;

	GET DIAGNOSTICS _rows_affected = ROW_COUNT;

	IF _rows_affected = 0 THEN
		RAISE EXCEPTION 'Bin with ID % not found or you do not have permission to update it.' ,(_data ->> '_bin_id');

	END IF;
	-- Get the updated bin with joined data
	SELECT
		INTO _result_data json_build_object('idField' , b.bin_id , 'nameField' , b.bin_name , 'descField' , b.bin_desc , 'locationId' , b.loc_id , 'locationName' , b.loc_name)
	FROM
		locations.v_bin b
	WHERE
		b.bin_id = _updated_bin_id;

	_success := TRUE;

	RETURN json_build_object('success' , _success , 'data' , _result_data , 'message' , 'Bin updated successfully');

EXCEPTION
	WHEN OTHERS THEN
		RETURN json_build_object('success' , FALSE , 'error' , json_build_object('code' , SQLSTATE , 'message' , SQLERRM , 'function' , 'fn_update_bin'));

END;

$$;

ALTER FUNCTION utils.fn_update_bin OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_create_market_type */
DROP FUNCTION IF EXISTS utils.fn_create_market_type;

CREATE OR REPLACE FUNCTION utils.fn_create_market_type(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_market_type_name' , '_market_type_desc'];
	_is_context_set BOOLEAN;
	_success BOOLEAN := FALSE;
BEGIN
	-- verify input parameters:
	-- set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_create_market_type');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	INSERT INTO markets.market_type(
		market_type_name
		, market_type_desc
		, created_by
		, org_id)
	VALUES (
		_data ->> '_market_type_name'
		, _data ->> '_market_type_desc'
		, _usr_id
		, _org_id)
RETURNING
	TRUE INTO _success;

	IF NOT _success THEN
		RAISE EXCEPTION 'Market type could not be added.';
	END IF;

	RETURN json_build_object('success' , _success);
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_create_market_type OWNER TO utils_admin;

------------
----------
--------
------
---
/*##  fn_get_market_types */
DROP FUNCTION IF EXISTS utils.fn_get_market_types;

CREATE OR REPLACE FUNCTION utils.fn_get_market_types(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_market_type_id'];
	_is_context_set BOOLEAN;
	_result JSON;
BEGIN
	-- verify input parameters:
	-- set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_get_market_types');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	SELECT
		INTO _result json_agg(json_build_object('idField' , t.market_type_id , 'nameField' , t.market_type_name , 'descField' , t.market_type_desc))
	FROM
		markets.v_market_type t
	WHERE (_data ->> '_market_type_id' IS NULL)
		OR t.market_type_id =(_data ->> '_market_type_id')::INTEGER;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'No records found in markets.market_type.';
	END IF;

	RETURN _result;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_get_market_types OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_update_market_type */
DROP FUNCTION IF EXISTS utils.fn_update_market_type;

CREATE OR REPLACE FUNCTION utils.fn_update_market_type(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_market_type_id' , '_market_type_name' , '_market_type_desc'];
	_is_context_set BOOLEAN;
	_rows_affected INTEGER;
	_updated_market_type_id INTEGER;
	_success BOOLEAN := FALSE;
	_result_data JSON;
BEGIN
	-- verify input parameters and set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_update_market_type');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';

	END IF;
	--! Main Action Here
	UPDATE
		markets.market_type mt
	SET
		market_type_name = _data ->> '_market_type_name'
		, market_type_desc = _data ->> '_market_type_desc'
	WHERE
		mt.market_type_id =(_data ->> '_market_type_id')::INTEGER
	RETURNING
		market_type_id INTO _updated_market_type_id;

	GET DIAGNOSTICS _rows_affected = ROW_COUNT;

	IF _rows_affected = 0 THEN
		RAISE EXCEPTION 'Market Type with ID % not found or you do not have permission to update it.' ,(_data ->> '_market_type_id');

	END IF;
	-- Get the updated market type data
	SELECT
		INTO _result_data json_build_object('idField' , mt.market_type_id , 'nameField' , mt.market_type_name , 'descField' , mt.market_type_desc)
	FROM
		markets.v_market_type mt
	WHERE
		mt.market_type_id = _updated_market_type_id;

	_success := TRUE;

	RETURN json_build_object('success' , _success , 'data' , _result_data , 'message' , 'Market Type updated successfully');

EXCEPTION
	WHEN OTHERS THEN
		RETURN json_build_object('success' , FALSE , 'error' , json_build_object('code' , SQLSTATE , 'message' , SQLERRM , 'function' , 'fn_update_market_type'));

END;

$$;

ALTER FUNCTION utils.fn_update_market_type OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_create_market */
DROP FUNCTION IF EXISTS utils.fn_create_market;

CREATE OR REPLACE FUNCTION utils.fn_create_market(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_market_name' , '_market_desc' , '_market_url' , '_market_type_id'];
	_is_context_set BOOLEAN;
	_success BOOLEAN := FALSE;
BEGIN
	-- verify input parameters:
	-- set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_create_market');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	INSERT INTO markets.market(
		market_name
		, market_desc
		, market_url
		, market_type_id
		, created_by
		, org_id)
	VALUES (
		_data ->> '_market_name'
		, _data ->> '_market_desc'
		, _data ->> '_market_url'
		,(
			_data ->> '_market_type_id') ::INT
		, _usr_id
		, _org_id)
RETURNING
	TRUE INTO _success;

	IF NOT _success THEN
		RAISE EXCEPTION 'Market could not be added.';
	END IF;

	RETURN json_build_object('success' , _success);
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_create_market OWNER TO utils_admin;

------------
----------
--------
------
---
/*##  fn_get_markets */
DROP FUNCTION IF EXISTS utils.fn_get_markets;

CREATE OR REPLACE FUNCTION utils.fn_get_markets(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_market_id'];
	_is_context_set BOOLEAN;
	_result JSON;
BEGIN
	-- verify input parameters:
	-- set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_get_markets');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	SELECT
		INTO _result json_agg(json_build_object('idField' , t.market_id , 'nameField' , t.market_name , 'marketTypeName' , t.market_type_name , 'marketTypeId' , t.market_type_id , 'descField' , t.market_desc , 'urlField' , t.market_url))
	FROM
		markets.v_market t
	WHERE (_data ->> '_market_id' IS NULL)
		OR t.market_id =(_data ->> '_market_id')::INTEGER;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'No records found in markets.market.';
	END IF;

	RETURN _result;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_get_markets OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_update_market */
DROP FUNCTION IF EXISTS utils.fn_update_market;

CREATE OR REPLACE FUNCTION utils.fn_update_market(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_market_id' , '_market_name' , '_market_desc' , '_market_url' , '_market_type_id'];
	_is_context_set BOOLEAN;
	_rows_affected INTEGER;
	_updated_market_id INTEGER;
	_success BOOLEAN := FALSE;
	_result_data JSON;
BEGIN
	-- verify input parameters and set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_update_market');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';

	END IF;
	--! Main Action Here
	UPDATE
		markets.market m
	SET
		market_name = _data ->> '_market_name'
		, market_desc = _data ->> '_market_desc'
		, market_url = _data ->> '_market_url'
		, market_type_id =(_data ->> '_market_type_id')::INTEGER
	WHERE
		m.market_id =(_data ->> '_market_id')::INTEGER
	RETURNING
		market_id INTO _updated_market_id;

	GET DIAGNOSTICS _rows_affected = ROW_COUNT;

	IF _rows_affected = 0 THEN
		RAISE EXCEPTION 'Market with ID % not found or you do not have permission to update it.' ,(_data ->> '_market_id');

	END IF;
	-- Get the updated market with joined data
	SELECT
		INTO _result_data json_build_object('idField' , m.market_id , 'nameField' , m.market_name , 'descField' , m.market_desc , 'urlField' , m.market_url , 'marketTypeId' , m.market_type_id , 'marketTypeName' , m.market_type_name)
	FROM
		markets.v_market m
	WHERE
		m.market_id = _updated_market_id;

	_success := TRUE;

	RETURN json_build_object('success' , _success , 'data' , _result_data , 'message' , 'Market updated successfully');

EXCEPTION
	WHEN OTHERS THEN
		RETURN json_build_object('success' , FALSE , 'error' , json_build_object('code' , SQLSTATE , 'message' , SQLERRM , 'function' , 'fn_update_market'));

END;

$$;

ALTER FUNCTION utils.fn_update_market OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_create_item */
DROP FUNCTION IF EXISTS utils.fn_create_item;

CREATE OR REPLACE FUNCTION utils.fn_create_item(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_item_name' , '_item_desc' , '_item_class_id'];
	_is_context_set BOOLEAN;
	_success BOOLEAN := FALSE;
BEGIN
	-- verify input parameters:
	-- set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_create_item');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	INSERT INTO items.item(
		item_name
		, item_desc
		, item_class_id
		, created_by
		, org_id)
	VALUES (
		_data ->> '_item_name'
		, _data ->> '_item_desc'
		,(
			_data ->> '_item_class_id') ::INT
		, _usr_id
		, _org_id)
RETURNING
	TRUE INTO _success;

	IF NOT _success THEN
		RAISE EXCEPTION 'Item could not be added.';
	END IF;

	RETURN json_build_object('success' , _success);
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_create_item OWNER TO utils_admin;

------------
----------
--------
------
SELECT
	*
FROM
	items.v_item;

---
/* ## fn_get_items */
DROP FUNCTION IF EXISTS utils.fn_get_items;

CREATE OR REPLACE FUNCTION utils.fn_get_items(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_item_id'];
	_is_context_set BOOLEAN;
	_result JSON;
BEGIN
	-- verify input parameters:
	-- set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_get_items');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	SELECT
		INTO _result json_agg(json_build_object('idField' , i.item_id , 'nameField' , i.item_name , 'descField' , i.item_desc , 'itemClassName' , i.item_class_name , 'itemClassId' , i.item_class_id , 'itemQOH' , COALESCE(i.qoh , 0)))
	FROM
		items.v_item i
	WHERE (_data ->> '_item_id' IS NULL)
		OR i.item_id =(_data ->> '_item_id')::INTEGER;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'No records found in items.item.';
	END IF;

	RETURN _result;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_get_items OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_update_item */
DROP FUNCTION IF EXISTS utils.fn_update_item;

CREATE OR REPLACE FUNCTION utils.fn_update_item(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_item_id' , '_item_name' , '_item_desc' , '_item_class_id'];
	_is_context_set BOOLEAN;
	_rows_affected INTEGER;
	_updated_item_id INTEGER;
	_success BOOLEAN := FALSE;
	_result_data JSON;
BEGIN
	-- verify input parameters and set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_update_item');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	UPDATE
		items.item i
	SET
		item_name = _data ->> '_item_name'
		, item_desc = _data ->> '_item_desc'
		, item_class_id =(_data ->> '_item_class_id')::INTEGER
	WHERE
		i.item_id =(_data ->> '_item_id')::INTEGER
	RETURNING
		item_id INTO _updated_item_id;
	GET DIAGNOSTICS _rows_affected = ROW_COUNT;

	IF _rows_affected = 0 THEN
		RAISE EXCEPTION 'Item with ID % not found or you do not have permission to update it.' ,(_data ->> '_item_id');
	END IF;

	SELECT
		INTO _result_data json_build_object('idField' , i.item_id , 'nameField' , i.item_name , 'descField' , i.item_desc , 'itemClassName' , i.item_class_name , 'itemClassId' , i.item_class_id , 'itemQOH' , COALESCE(i.qoh , 0))
	FROM
		items.v_item i
	WHERE
		i.item_id = _updated_item_id;

	_success := TRUE;

	RETURN json_build_object('success' , _success , 'data' , _result_data , 'message' , 'Item updated successfully');

EXCEPTION
	WHEN OTHERS THEN
		RETURN json_build_object('success' , FALSE , 'error' , json_build_object('code' , SQLSTATE , 'message' , SQLERRM , 'function' , 'fn_update_item'));
END;

$$;

ALTER FUNCTION utils.fn_update_item OWNER TO utils_admin;

------------
----------
--------
------
---
DROP FUNCTION IF EXISTS utils.fn_get_item_qoh;

CREATE OR REPLACE FUNCTION utils.fn_get_item_qoh(_data JSONB)
	RETURNS
	/* JSON */
	DECIMAL (
		8 , 2)
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_item_id' , '_bin_id'];
	_is_context_set BOOLEAN;
	-- _result JSON;
	_QOH DECIMAL(8 , 2) := 0;
BEGIN
	-- verify input parameters:
	-- set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_get_trx_types');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	--get current QOH
	SELECT
		q.item_qty INTO _QOH
	FROM
		items.item_qty q
	WHERE
		q.item_id =(_data ->> '_item_id')::INTEGER
		AND q.bin_id =(_data ->> '_bin_id')::INTEGER;
	-- SELECT
	-- 	INTO _result json_agg(json_build_object('idField' , q.item_qty_id , 'itemId' , q.item_Id , 'binId' , q.bin_id , 'itemQoh' , q.item_qty))
	-- FROM
	-- 	items.item_qty q
	-- WHERE
	-- 	q.item_id =(_data ->> '_item_id')::INTEGER
	-- 	AND q.bin_id =(_data ->> '_bin_id')::INTEGER;
	IF NOT FOUND THEN
		RAISE EXCEPTION 'No item quantity exists for item % and bin %.' ,(_data ->> '_item_id') ,(_data ->> '_bin_id');
	END IF;
	-- make sure it is not negative
	IF _QOH < 0 THEN
		RAISE EXCEPTION 'Negative QOH Error. Contact admin. The current QOH is % for item % in bin %.' , _QOH , _item_id , _bin_id;
	END IF;

	RETURN _QOH;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_get_item_qoh OWNER TO utils_admin;

-----------
----------
-------
-----
---
--
