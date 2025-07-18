RESET ROLE;

SELECT
	"current_user"();

-----
----
--
/* ## fn_create_transaction_type */
DROP FUNCTION IF EXISTS utils.fn_create_trx_type;

CREATE OR REPLACE FUNCTION utils.fn_create_trx_type(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_trx_type_name' , '_trx_type_desc' , '_trx_direction_id'];
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
		_fn_set_app_context(_data , _data_keys , 'fn_create_trx_type');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	INSERT INTO trans.trx_type(
		trx_type_name
		, trx_type_desc
		, trx_direction_id
		, created_by
		, org_id)
	VALUES (
		_data ->> '_trx_type_name'
		, _data ->> '_trx_type_desc'
		,(
			_data ->> '_trx_direction_id') ::INT
		, _usr_id
		, _org_id)
RETURNING
	TRUE INTO _success;

	IF NOT _success THEN
		RAISE EXCEPTION 'Transaction type could not be added!';
	END IF;

	RETURN json_build_object('success' , _success);
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_create_trx_type OWNER TO utils_admin;

------------
----------
--------
------------
---
/* ## fn_get_trx_types */
DROP FUNCTION IF EXISTS utils.fn_get_trx_types;

CREATE OR REPLACE FUNCTION utils.fn_get_trx_types(IN _data JSONB)
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
		_fn_set_app_context(_data , _data_keys , 'fn_get_trx_types');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	SELECT
		INTO _result json_agg(json_build_object('id' , t.trx_type_id , 'name' , t.trx_type_name , 'direction' , t.trx_direction , 'trx_type_desc' , t.trx_type_desc))
	FROM
		trans.v_trx_type t;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'No records found in trans.trx_type!';
	END IF;

	RETURN _result;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_get_trx_types OWNER TO utils_admin;

------------
----------
--------
------
---
------------
----------
--------
------
---
/* ## _fn_get_trx_direction_id */
DROP FUNCTION IF EXISTS utils._fn_get_trx_direction_id;

CREATE OR REPLACE FUNCTION utils._fn_get_trx_direction_id(IN _trx_type_id INTEGER)
	RETURNS INTEGER
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_trx_direction_id INTEGER;
BEGIN
	--! Main Action Here
	SELECT
		tt.trx_direction_id INTO _trx_direction_id
	FROM
		trans.trx_type tt
	WHERE
		tt.trx_type_id = _trx_type_id;

	RETURN _trx_direction_id;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_get_trx_direction_id OWNER TO utils_admin;

-- DROP FUNCTION IF EXISTS utils._fn_assert_item_QOH;
-- CREATE OR REPLACE FUNCTION utils._fn_assert_item_QOH(IN _item_id INTEGER , IN _bin_id INTEGER , _qty_out DECIMAL(8 , 2))
-- 	RETURNS void
-- 	LANGUAGE plpgsql
-- 	SECURITY DEFINER
-- 	SET search_path = utils
-- 	AS $$
-- DECLARE
-- 	_QOH DECIMAL(8 , 2) := 0;
-- BEGIN
-- 	--! Assert logic here
-- 	--get current QOH
-- 	SELECT
-- 		q.item_qty INTO _QOH
-- 	FROM
-- 		items.item_qty q
-- 	WHERE
-- 		q.item_id = _item_id
-- 		AND q.bin_id = bin_id;
-- 	IF NOT FOUND THEN
-- 		RAISE EXCEPTION 'No item quantity exists for item %.' , _item_id;
-- 	END IF;
-- 	-- make sure it is not negative
-- 	IF _QOH < 0 THEN
-- 		RAISE EXCEPTION 'Negative QOH Error. Contact admin. The current QOH is % for item % in bin %.' , _QOH , _item_id , _bin_id;
-- 	END IF;
-- 	-- make sure there is enough QOH
-- 	IF _qty_out > _QOH THEN
-- 		RAISE EXCEPTION 'Not enough quantity avialable. Transaction qty is %, while the current QOH is % for item % in bin %.' , _qty_out , _QOH , _item_id , _bin_id;
-- 	END IF;
-- EXCEPTION
-- 	WHEN OTHERS THEN
-- 		RAISE;
-- END;
-- $$;
-- ALTER FUNCTION utils._fn_assert_item_QOH OWNER TO utils_admin;
-------------
----------
-------
-----
---
--
DROP FUNCTION IF EXISTS utils._fn_not_enough_item_QOH;

CREATE OR REPLACE FUNCTION utils._fn_not_enough_item_QOH(IN _item_id INTEGER , IN _bin_id INTEGER , _qty_out DECIMAL(8 , 2))
	RETURNS BOOLEAN
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_QOH DECIMAL(8 , 2) := 0;
BEGIN
	--! Assert logic here
	--get current QOH
	SELECT
		q.item_qty INTO _QOH
	FROM
		items.item_qty q
	WHERE
		q.item_id = _item_id
		AND q.bin_id = _bin_id;
	IF NOT FOUND OR _qty_out > _QOH THEN
		RETURN TRUE;
	END IF;
	-- RETURN FALSE;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_not_enough_item_QOH OWNER TO utils_admin;

-------------
----------
-------
-----
---
--
/* ##--! CREATE_item_trx */
--this is called from the application.
--it combines both header and line inserts
--it accepts _data json including both the header and line details information
--all or nothing insert to ensure data integrity
-- inserts header row then inserts trx line detail then updated QOH
/* ## _fn_assert_item_trx_input */
DROP FUNCTION IF EXISTS utils._fn_assert_valid_item_trx_input;

CREATE OR REPLACE FUNCTION utils._fn_assert_valid_item_trx_input(IN _data JSONB)
	RETURNS void
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_trx_header_keys TEXT[] := ARRAY['_trx_desc' , '_trx_date' , '_trx_type_id' , '_market_id' , '_num_of_lines'];
	_trx_detail_line_keys TEXT[] := ARRAY['_trx_line_num' , '_item_trx_desc' , '_item_id' , '_from_bin' , '_to_bin' , '_qty_in' , '_qty_out'];
	_trx_direction_id INTEGER;
	_failing_lines JSONB;
	_error_count INTEGER;
BEGIN
	-- validate LEVEL 2 - in the jsonb
	-- Validate header fields
	PERFORM
		_fn_assert_input_keys_param(_data -> '_trx_header' , _trx_header_keys , '_trx_header');
	--get trx_direction_id
	_trx_direction_id := _fn_get_trx_direction_id((_data -> '_trx_header' ->> '_trx_type_id')::INT);
	-- Validate trx_details is an array with at least one object
	IF jsonb_typeof(_data -> '_trx_details') <> 'array' OR jsonb_array_length(_data -> '_trx_details') = 0 THEN
		RAISE EXCEPTION 'trx_details must be a non-empty array.';
	END IF;
	IF jsonb_array_length(_data -> '_trx_details') <>(_data -> '_trx_header' ->> '_num_of_lines')::INT THEN
		RAISE EXCEPTION '_fn_assert_valid_item_trx_input mismatch  _num_of_lines ';
	END IF;
	-- Loop through each detail object to validate required fields. The approach could be to loop through the array elements or use a set approach which is more performant.
	--! Assert logic here
	-- Collect failing lines with basic error info
	SELECT
		jsonb_agg(jsonb_build_object('line' ,(_obj ->> '_trx_line_num')::INT , 'error' , CASE WHEN NOT (_obj ?& _trx_detail_line_keys) THEN
					'missing_required_fields'
				WHEN _trx_direction_id = 1
					AND (_obj ->> '_qty_in' IS NULL
						OR ((_obj ->> '_qty_in')::decimal(8 , 2)) = 0
					OR _obj ->> '_to_bin' IS NULL
					OR _obj ->> '_qty_out' IS NOT NULL
					OR _obj ->> '_from_bin' IS NOT NULL) THEN
					'invalid_in_transaction'
				WHEN _trx_direction_id = 2
					AND (_obj ->> '_qty_out' IS NULL
						OR (((_obj ->> '_qty_out')::decimal(8 , 2))) = 0
					OR _obj ->> '_from_bin' IS NULL
					OR _obj ->> '_qty_in' IS NOT NULL
					OR _obj ->> '_to_bin' IS NOT NULL
					-- OR _fn_not_enough_item_QOH((_obj ->> '_item_id')::INT ,(_obj ->> '_from_bin')::INT ,((_obj ->> '_qty_out')::DECIMAL(8 , 2)))
) THEN
					'invalid_out_transaction'
				WHEN _trx_direction_id = 3
					AND (_obj ->> '_qty_in' IS NULL
						OR ((_obj ->> '_qty_in')::decimal(8 , 2)) = 0
					OR _obj ->> '_to_bin' IS NULL
					OR _obj ->> '_qty_out' IS NULL
					OR ((_obj ->> '_qty_out')::decimal(8 , 2)) = 0
					OR _obj ->> '_from_bin' IS NULL
					OR _obj ->> '_to_bin' = _obj ->> '_from_bin'
					-- OR _fn_not_enough_item_QOH((_obj ->> '_item_id')::INT ,(_obj ->> '_from_bin')::INT ,((_obj ->> '_qty_out')::DECIMAL(8 , 2)))
) THEN
					'invalid_in_out_transaction'
				WHEN _trx_direction_id IN (2 , 3)
					AND _fn_not_enough_item_QOH((_obj ->> '_item_id')::INT ,(_obj ->> '_from_bin')::INT ,((_obj ->> '_qty_out')::DECIMAL(8 , 2))) THEN
					'Not enough QOH. Current QOH is :'
				ELSE
					NULL
				END , '_data->' , _obj))
		, COUNT(*) INTO _failing_lines
		, _error_count
	FROM
		jsonb_array_elements(_data -> '_trx_details') AS detail(_obj)
WHERE
	NOT (_obj ?& _trx_detail_line_keys)
		OR (_trx_direction_id = 1
			AND (_obj ->> '_qty_in' IS NULL
				OR ((_obj ->> '_qty_in')::decimal(8 , 2)) = 0
				OR _obj ->> '_to_bin' IS NULL
				OR _obj ->> '_qty_out' IS NOT NULL
				OR _obj ->> '_from_bin' IS NOT NULL))
		OR (_trx_direction_id = 2
			AND (_obj ->> '_qty_out' IS NULL
				OR (((_obj ->> '_qty_out')::decimal(8 , 2))) = 0
				OR _obj ->> '_from_bin' IS NULL
				OR _obj ->> '_qty_in' IS NOT NULL
				OR _obj ->> '_to_bin' IS NOT NULL
				OR _fn_not_enough_item_QOH((_obj ->> '_item_id')::INT ,(_obj ->> '_from_bin')::INT ,((_obj ->> '_qty_out')::DECIMAL(8 , 2)))))
		OR (_trx_direction_id = 3
			AND (_obj ->> '_qty_in' IS NULL
				OR ((_obj ->> '_qty_in')::decimal(8 , 2)) = 0
				OR _obj ->> '_to_bin' IS NULL
				OR _obj ->> '_qty_out' IS NULL
				OR ((_obj ->> '_qty_out')::decimal(8 , 2)) = 0
				OR _obj ->> '_from_bin' IS NULL
				OR _obj ->> '_to_bin' = _obj ->> '_from_bin'
				OR _fn_not_enough_item_QOH((_obj ->> '_item_id')::INT ,(_obj ->> '_from_bin')::INT ,((_obj ->> '_qty_out')::DECIMAL(8 , 2)))));
	IF _error_count > 0 THEN
		RAISE EXCEPTION '_fn_assert_valid_item_trx_input failed for % line(s). Details: %' , _error_count , _failing_lines;
	END IF;

EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils._fn_assert_valid_item_trx_input OWNER TO utils_admin;

----------
-------
-----
----
--
/* ## fn_create_item_trx */
DROP FUNCTION IF EXISTS utils.fn_create_item_trx;

CREATE OR REPLACE FUNCTION utils.fn_create_item_trx(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_is_context_set BOOLEAN := FALSE;
	_trx_direction_id INTEGER;
	_item_trx_id INTEGER;
	_insert_row_count INTEGER;
	_success BOOLEAN := FALSE;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , '_trx_header' , '_trx_details'];
BEGIN
	-- verify input parameters:
	-- set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_create_item_trx' , 'trans');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	--get trx_direction_id
	_trx_direction_id := _fn_get_trx_direction_id((_data -> '_trx_header' ->> '_trx_type_id')::INT);
	--============================
	--insert transaction header
	--============================
	INSERT INTO trans.item_trx(
		trx_desc
		, trx_date
		, trx_type_id
		, market_id
		, num_of_lines
		, created_by
		, org_id)
	VALUES (
		_data -> '_trx_header' ->> '_trx_desc'
		,(
			_data -> '_trx_header' ->> '_trx_date') ::DATE
		,(
			_data -> '_trx_header' ->> '_trx_type_id') ::INT
		,(
			_data -> '_trx_header' ->> '_market_id') ::INT
		,(
			_data -> '_trx_header' ->> '_num_of_lines') ::INT
		, _usr_id
		, _org_id)
RETURNING
	item_trx_id INTO _item_trx_id;
	--=============================
	-- inert transactions details
	--=============================
	INSERT INTO trans.item_trx_detail(
		item_trx_id
		, trx_line_num
		, item_trx_desc
		, item_id
		, from_bin
		, to_bin
		, qty_in
		, qty_out
		, created_by
		, org_id)
	SELECT
		_item_trx_id
		, d._trx_line_num::INT
		, d._item_trx_desc
		, d._item_id::INT
		, d._from_bin::INT
		, d._to_bin::INT
		, d._qty_in::NUMERIC
		, d._qty_out::INT
		, _usr_id
		, _org_id
	FROM
		jsonb_to_recordset(_data -> '_trx_details') AS d(_trx_line_num INTEGER
		, _item_trx_desc TEXT
		, _item_id INTEGER
		, _from_bin INTEGER
		, _to_bin INTEGER
		, _qty_in DECIMAL(8 , 2)
		, _qty_out DECIMAL(8 , 2));
	get diagnostics _insert_row_count = ROW_COUNT;
	--validate row count
	IF NOT _insert_row_count =(_data -> '_trx_header' ->> '_num_of_lines')::INT THEN
		RAISE EXCEPTION 'Number of rows inserted does not match _data jsonb. Item transaction could not be added!';
	END IF;
	--==================
	-- upsert QOH
	--==================
	IF _trx_direction_id IN (1 , 2) THEN
		MERGE INTO items.item_qty AS target
		USING (
			SELECT
				a.org_id , a.item_id , a.bin_id , sum(a.qty) AS qty , 1000 AS created_by
				FROM (
					SELECT
						d.org_id , i.item_trx_id , d.item_trx_detail_id , d.item_id ,
							CASE t.trx_direction_id
							WHEN 1 THEN
								d.to_bin
							WHEN 2 THEN
								d.from_bin
							END AS bin_id ,
								CASE t.trx_direction_id
								WHEN 1 THEN
									d.qty_in
								WHEN 2 THEN
									d.qty_out
								END AS qty
							FROM
								trans.item_trx_detail d
								JOIN trans.item_trx i ON d.item_trx_id = i.item_trx_id
								JOIN trans.trx_type t ON i.trx_type_id = t.trx_type_id
							WHERE
								t.trx_direction_id IN (1 , 2)) a
								WHERE
									a.item_trx_id = _item_trx_id
								GROUP BY
									a.org_id , a.item_id , a.bin_id , created_by) AS source ON (target.item_id = source.item_id
								AND target.bin_id = source.bin_id
								AND target.org_id = source.org_id)
		WHEN Matched THEN
				UPDATE
					SET
						item_qty = target.item_qty + source.qty , modified_by = source.created_by , modified_at = now()
		WHEN NOT matched THEN
				INSERT
					(
					item_id , bin_id , item_qty , created_by , org_id)
					VALUES (
					source.item_id , source.bin_id , source.qty , source.created_by , source.org_id);
		ELSEIF _trx_direction_id = 3 THEN
		MERGE INTO items.item_qty AS target
		USING (
			SELECT
				a.org_id , a.item_id , a.bin_id , sum(a.qty) AS qty , 1000 AS created_by
				FROM (
					SELECT
						d.org_id , i.item_trx_id , d.item_trx_detail_id , d.item_id , d.from_bin AS bin_id , d.qty_out AS qty
					FROM
						trans.item_trx_detail d
						JOIN trans.item_trx i ON d.item_trx_id = i.item_trx_id
						JOIN trans.trx_type t ON i.trx_type_id = t.trx_type_id
					WHERE
						t.trx_direction_id = 3
					UNION
						ALL
								SELECT
									d.org_id , i.item_trx_id , d.item_trx_detail_id , d.item_id , d.to_bin AS bin_id , d.qty_in AS qty
								FROM
									trans.item_trx_detail d
									JOIN trans.item_trx i ON d.item_trx_id = i.item_trx_id
									JOIN trans.trx_type t ON i.trx_type_id = t.trx_type_id
								WHERE
									t.trx_direction_id = 3) a
								WHERE
									a.item_trx_id = _item_trx_id
								GROUP BY
									a.org_id , a.item_id , a.bin_id , created_by) AS source ON (target.item_id = source.item_id
								AND target.bin_id = source.bin_id
								AND target.org_id = source.org_id)
		WHEN Matched THEN
			UPDATE SET
				item_qty = target.item_qty + source.qty , modified_by = source.created_by , modified_at = now()
		WHEN NOT matched THEN
			INSERT (
			item_id , bin_id , item_qty , created_by , org_id)
			VALUES (
			source.item_id , source.bin_id , source.qty , source.created_by , source.org_id);
	END IF;
		RETURN json_build_object('success' , _success , 'item_trx_id' , _item_trx_id);
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_create_item_trx OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_get_item_trans */
DROP FUNCTION IF EXISTS utils.fn_get_item_trans;

CREATE OR REPLACE FUNCTION utils.fn_get_item_trans(IN _data JSONB)
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
	-- verify input parameters and set org context and get usr_id, org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_get_item_trans');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	SELECT
		INTO _result json_agg(json_build_object('id' , t.item_trx_id , 'date' , t.trx_date , 'description' , t.trx_desc , 'trx_type_id' , t.trx_type_id , 'trx_type_name' , t.trx_type_name , 'direction' , trx_direction , 'market_id' , t.market_id , 'market_name' , t.market_name , 'URL' , t.market_url))
	FROM
		trans.v_item_trx t
	WHERE (_data ->> 'item_trx_id' IS NULL)
		OR t.item_trx_id =(_data ->> 'item_trx_id')::INTEGER;
	IF NOT FOUND THEN
		RAISE EXCEPTION 'No records found in trans.item_trx!';
	END IF;

	RETURN _result;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_get_item_trans OWNER TO utils_admin;

------------
----------
--------
------
---
/* ## fn_get_item_trx_details */
DROP FUNCTION IF EXISTS utils.fn_get_item_trx_details;

CREATE OR REPLACE FUNCTION utils.fn_get_item_trx_details(IN _data JSONB)
	RETURNS JSON
	LANGUAGE plpgsql
	SECURITY DEFINER
	SET search_path = utils
	AS $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := ARRAY['_org_uuid' , '_usr_uuid' , 'item_trx_id'];
	_is_context_set BOOLEAN;
	_result JSON;
BEGIN
	-- verify input parameters and get _usr_id and _org_id:
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		_fn_set_app_context(_data , _data_keys , 'fn_get_item_trx_details');
	-- if all set:
	IF NOT _is_context_set THEN
		RAISE EXCEPTION 'Context could not be set.';
	END IF;
	--! Main Action Here
	SELECT
		json_build_object('item_trx_id' , d.item_trx_id , 'item_trx_details' , json_agg(json_build_object('id' , d.trx_line_num , 'item_trx_desc' , d.item_trx_desc , 'item_id' , d.item_id , 'item_name' , d.item_name , 'from_bin' , d.from_bin , 'from_bin_desc' , d.from_bin_desc , 'to_bin' , d.to_bin , 'to_bin_desc' , d.to_bin_desc , 'qty_in' , d.qty_in , 'qty_out' , d.qty_out))) INTO _result
	FROM
		trans.v_item_trx_detail d
	WHERE
		d.item_trx_id =(_data ->> 'item_trx_id')::INTEGER
	GROUP BY
		d.item_trx_id;

	IF NOT FOUND THEN
		RAISE EXCEPTION 'No records found in trans.item_trx_detail!';
	END IF;

	RETURN _result;
EXCEPTION
	WHEN OTHERS THEN
		RAISE;
END;

$$;

ALTER FUNCTION utils.fn_get_item_trx_details OWNER TO utils_admin;
