RESET ROLE;

SELECT
	"current_user"();

SET search_path = utils;

--* create new users
DO $$
DECLARE
	_i INTEGER;
	_msg TEXT;
BEGIN
	FOR _i IN 5..7 LOOP
		RAISE NOTICE 'Creating test_usr%:' , _i;
		EXECUTE FORMAT($f$
			SELECT
				utils.fn_create_usr(jsonb_build_object('_usr_name' , 'test_usr%s' , '_first_name' , 'test' , '_last_name' , 'test' , '_email' , 'email@emailcom'));
		$f$
		, _i::TEXT) INTO _msg;
		RAISE NOTICE '%' , _msg;
	END LOOP;
END;
$$;

------------
----------
--------
------
---
--*create new organizations
DO $$
DECLARE
	_i INTEGER;
	_msg TEXT;
	_usr_uuid UUID :=(
		SELECT
			u.usr_uuid
		FROM
			usrs.usr u
		WHERE
			u.usr_name = 'sa');
BEGIN
	FOR _i IN 5..7 LOOP
		RAISE NOTICE 'Creating test_org%:' , _i;
		EXECUTE FORMAT($f$
			SELECT
				utils.fn_create_organization(jsonb_build_object('_org_name' , 'test_org%s' , '_usr_uuid' , '%s'));
		$f$
		, _i::TEXT
		, _usr_uuid::UUID) INTO _msg;
		RAISE NOTICE '%' , _msg;
	END LOOP;
END;
$$;

--* CREATE item classes
DO $$
DECLARE
	_i INTEGER;
	_msg TEXT;
	_usr_uuid UUID :=(
		SELECT
			u.usr_uuid
		FROM
			usrs.usr u
		WHERE
			u.usr_name = 'sa');
	_org_uuid UUID :=(
		SELECT
			o.org_uuid
		FROM
			orgs.org o
		WHERE
			o.org_name = 'test_org5');
BEGIN
	FOR _i IN 5..7 LOOP
		RAISE NOTICE 'Creating itemClass%:' , _i;
		EXECUTE FORMAT($f$
			SELECT
				utils.fn_create_item_class(jsonb_build_object('_org_uuid' , '%s' , '_usr_uuid' , '%s' , '_item_class_name' , 'itemClass%s' , '_item_class_desc' , 'text%s text text text text'));
		$f$
		, _org_uuid::UUID
		, _usr_uuid::UUID
		, _i::TEXT
		, _i::TEXT) INTO _msg;
		RAISE NOTICE '%' , _msg;
	END LOOP;
	RESET ROLE;
END;
$$;

--* CREATE LOCATION
DO $$
DECLARE
	_i INTEGER;
	_msg TEXT;
	_usr_uuid UUID :=(
		SELECT
			u.usr_uuid
		FROM
			usrs.usr u
		WHERE
			u.usr_name = 'sa');
	_org_uuid UUID :=(
		SELECT
			o.org_uuid
		FROM
			orgs.org o
		WHERE
			o.org_name = 'test_org5');
BEGIN
	FOR _i IN 5..7 LOOP
		RAISE NOTICE 'Creating location%:' , _i;
		EXECUTE FORMAT($f$
			SELECT
				utils.fn_create_location(jsonb_build_object('_org_uuid' , '%s' , '_usr_uuid' , '%s' , '_loc_name' , 'location%s' , '_loc_desc' , 'text%s text text text text'));
		$f$
		, _org_uuid::UUID
		, _usr_uuid::UUID
		, _i::TEXT
		, _i::TEXT) INTO _msg;
		RAISE NOTICE '%' , _msg;
	END LOOP;
END;
$$;

------------
----------
--------
------
---
--*CREATE bin
DO $$
DECLARE
	_i INTEGER;
	_msg TEXT;
	_usr_uuid UUID :=(
		SELECT
			u.usr_uuid
		FROM
			usrs.usr u
		WHERE
			u.usr_name = 'sa');
	_org_uuid UUID :=(
		SELECT
			o.org_uuid
		FROM
			orgs.org o
		WHERE
			o.org_name = 'test_org5');
	_loc_id INTEGER :=(
		SELECT
			l.loc_id
		FROM
			locations.location l
		ORDER BY
			l.loc_id DESC
		LIMIT 1);
BEGIN
	FOR _i IN 5..7 LOOP
		RAISE NOTICE 'Creating bin%:' , _i;
		EXECUTE FORMAT($f$
			SELECT
				utils.fn_create_bin(jsonb_build_object('_org_uuid' , '%s' , '_usr_uuid' , '%s' , '_bin_name' , 'bin%s' , '_bin_desc' , 'text%s text text text text' , '_loc_id' , '%s'));
		$f$
		, _org_uuid::UUID
		, _usr_uuid::UUID
		, _i::TEXT
		, _i::TEXT
		, _loc_id::INT) INTO _msg;
		RAISE NOTICE '%' , _msg;
	END LOOP;
END;
$$;

------------
----------
--------
------
---
--*CREATE market_type
DO $$
DECLARE
	_i INTEGER;
	_msg TEXT;
	_usr_uuid UUID :=(
		SELECT
			u.usr_uuid
		FROM
			usrs.usr u
		WHERE
			u.usr_name = 'sa');
	_org_uuid UUID :=(
		SELECT
			o.org_uuid
		FROM
			orgs.org o
		WHERE
			o.org_name = 'test_org5');
BEGIN
	FOR _i IN 5..7 LOOP
		RAISE NOTICE 'Creating market_type%:' , _i;
		EXECUTE FORMAT($f$
			SELECT
				utils.fn_create_market_type(jsonb_build_object('_org_uuid' , '%s' , '_usr_uuid' , '%s' , '_market_type_name' , 'market_type%s' , '_market_type_desc' , 'text%s text text text text'));
		$f$
		, _org_uuid::UUID
		, _usr_uuid::UUID
		, _i::TEXT
		, _i::TEXT) INTO _msg;
		RAISE NOTICE '%' , _msg;
	END LOOP;
END;
$$;

------------
----------
--------
------
---
--* CREATE market
DO $$
DECLARE
	_i INTEGER;
	_msg TEXT;
	_usr_uuid UUID :=(
		SELECT
			u.usr_uuid
		FROM
			usrs.usr u
		WHERE
			u.usr_name = 'sa');
	_org_uuid UUID :=(
		SELECT
			o.org_uuid
		FROM
			orgs.org o
		WHERE
			o.org_name = 'test_org5');
	_market_type_id INTEGER :=(
		SELECT
			mt.market_type_id
		FROM
			markets.market_type mt
		ORDER BY
			mt.market_type_id DESC
		LIMIT 1);
BEGIN
	FOR _i IN 5..7 LOOP
		RAISE NOTICE 'Creating market%:' , _i;
		EXECUTE FORMAT($f$
			SELECT
				utils.fn_create_market(jsonb_build_object('_org_uuid' , '%s' , '_usr_uuid' , '%s' , '_market_name' , 'market%s' , '_market_desc' , 'text%s text text text text' , '_market_type_id' , '%s' , '_market_url' , 'url.url.com'));
		$f$
		, _org_uuid::UUID
		, _usr_uuid::UUID
		, _i::TEXT
		, _i::TEXT
		, _market_type_id::INT) INTO _msg;
		RAISE NOTICE '%' , _msg;
	END LOOP;
END;
$$;

------------
----------
--------
------
---
--*CREATE item
DO $$
DECLARE
	_i INTEGER;
	_msg TEXT;
	_usr_uuid UUID :=(
		SELECT
			u.usr_uuid
		FROM
			usrs.usr u
		WHERE
			u.usr_name = 'sa');
	_org_uuid UUID :=(
		SELECT
			o.org_uuid
		FROM
			orgs.org o
		WHERE
			o.org_name = 'test_org5');
	_item_class_id INTEGER :=(
		SELECT
			ic.item_class_id
		FROM
			items.item_class ic
		ORDER BY
			ic.item_class_id DESC
		LIMIT 1);
BEGIN
	FOR _i IN 5..7 LOOP
		RAISE NOTICE 'Creating item%:' , _i;
		EXECUTE FORMAT($f$
			SELECT
				utils.fn_create_item(jsonb_build_object('_org_uuid' , '%s' , '_usr_uuid' , '%s' , '_item_name' , 'item%s' , '_item_desc' , 'text%s text text text text' , '_item_class_id' , '%s'));
		$f$
		, _org_uuid::UUID
		, _usr_uuid::UUID
		, _i::TEXT
		, _i::TEXT
		, _item_class_id::INT) INTO _msg;
		RAISE NOTICE '%' , _msg;
	END LOOP;
END;
$$;

------------
----------
--------
------
---
--* transaction type
DO $$
DECLARE
	_i INTEGER;
	_j INTEGER;
	_msg TEXT;
	_usr_uuid UUID :=(
		SELECT
			u.usr_uuid
		FROM
			usrs.usr u
		WHERE
			u.usr_name = 'sa');
	_org_uuid UUID :=(
		SELECT
			o.org_uuid
		FROM
			orgs.org o
		WHERE
			o.org_name = 'test_org5');
BEGIN
	FOR _i IN 1..3 LOOP
		RAISE NOTICE 'Creating trxType%:' , _i;
		EXECUTE FORMAT($f$
			SELECT
				utils.fn_create_trx_type(jsonb_build_object('_org_uuid' , '%s' , '_usr_uuid' , '%s' , '_trx_type_name' , 'trx_Type%s' , '_trx_type_desc' , 'text%s text text text text' , '_trx_direction_id' , '%s'));
		$f$
		, _org_uuid::UUID
		, _usr_uuid::UUID
		, _i::TEXT
		, _i::TEXT
		, _i) INTO _msg;
		RAISE NOTICE '%' , _msg;
	END LOOP;
END;
$$;

------------
----------
--------
------
---
