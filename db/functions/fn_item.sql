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
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid'];
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
		INTO _result json_build_object('itemClass' , json_agg(json_build_object('item_class_id' , ic.item_class_id , 'item_class_name' , ic.item_class_name , 'item_class_desc' , ic.item_class_desc)))
	FROM
		items.item_class ic;

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
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid'];
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
		INTO _result json_build_object('locations' , json_agg(json_build_object('loc_id' , t.loc_id , 'loc_name' , t.loc_name , 'loc_desc' , t.loc_desc)))
	FROM
		locations.location t;

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
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid'];
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
		INTO _result json_build_object('bins' , json_agg(json_build_object('bin_id' , t.bin_id , 'bin_name' , t.bin_name , 'bin_desc' , t.bin_desc)))
	FROM
		locations.bin t;

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
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid'];
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
		INTO _result json_build_object('marketTypes' , json_agg(json_build_object('market_type_id' , t.market_type_id , 'market_type_name' , t.market_type_name , 'market_type_desc' , t.market_type_desc)))
	FROM
		markets.market_type t;

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
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid'];
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
		INTO _result json_build_object('markets' , json_agg(json_build_object('market_id' , t.market_id , 'market_name' , t.market_name , 'market_desc' , t.market_desc , 'market_url' , t.market_url)))
	FROM
		markets.market t;

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
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid'];
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
		INTO _result json_build_object('items' , json_agg(json_build_object('item_id' , t.item_id , 'item_name' , t.item_name , 'item_desc' , t.item_desc , 'item_class_id' , t.item_class_id)))
	FROM
		items.item t;

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
