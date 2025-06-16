/* Test scinarios */
--
--
--*start
SELECT
	*
FROM
	orgs.org;

SELECT
	*
FROM
	usrs.usr;

-- DELETE FROM usrs.usr WHERE usr_id > 1001;
SELECT
	*
FROM
	usrs.v_usr_org;

---------
---------
--* assert user name not exists
SELECT
	utils._fn_assert_usr_not_exist('test_usr2');

SELECT
	utils._fn_assert_usr_not_exist('sa');

-----------
------------
-----------
--* create new user
--run twice
SELECT
	utils.fn_create_usr('{"_usr_name":"test_usr2", "_first_name":"test", "_last_name":"test", "_email":"email@email.com"}'::JSONB);

SELECT
	*
FROM
	usrs.usr;

--* get user uuid from user name
SELECT
	*
FROM
	utils.fn_get_usr_uuid('test_usr2');

--155b29b7-375a-407f-8168-f2090d61518e
--* get user id from user uuid
SELECT
	utils._fn_get_usr_id('155b29b7-375a-407f-8168-f2090d61518e');

SELECT
	-----------
	--* assert organization name not exists
	SELECT
		utils._fn_assert_org_not_exist('test_co2');

SELECT
	utils._fn_assert_org_not_exist('test_co');

--* create organization
--RUN TWICE
-- --supabase
-- SELECT
-- 	utils.fn_create_organization('{"_org_name":"test2", "_usr_uuid":"b984015f-8dfc-423e-b519-e46f2f541793"}'::JSONB);
-- --local
SELECT
	utils.fn_create_organization(jsonb_build_object('_org_name' , 'test_co2' , '_usr_uuid' ,(
				SELECT
					u.usr_uuid
				FROM usrs.usr u
				WHERE
					u.usr_name = 'sa')));

SELECT
	*
FROM
	orgs.org;

SELECT
	*
FROM
	usrs.v_usr_org;

-- DELETE FROM usrs.usr_org
-- WHERE org_id <> 1000;
-- DELETE FROM orgs.org
-- WHERE org_id <> 1000;
--1001
--* assert user is not assigned to organization already
SELECT
	utils._fn_assert_usr_org_not_exist(1000 , 1000);

SELECT
	utils._fn_assert_usr_org_not_exist(1000 , 1001);

SELECT
	utils._fn_assert_usr_org_not_exist(1000 , 1002);

-- SELECT * FROM orgs.org;
-- SELECT * from usrs.usr;
-- SELECT * FROM usrs.v_usr_org;
--* assign user to organization
SELECT
	utils._fn_assign_usr_org(1001 , 1000);

-- SELECT * FROM usrs.v_usr_org;
-------
---
'1000	7377c9df-4fa9-4b4d-b1d9-1877d2711e9a	sa	1000	test_co 1bfabc56-116d-4db4-ba16-77d2f5699ca5
1000	7377c9df-4fa9-4b4d-b1d9-1877d2711e9a	sa	1002	test_co2 aadb7c11-b96a-495d-86a3-31e3ab4deabe
1001	155b29b7-375a-407f-8168-f2090d61518e	test_usr2	1000	test_co 1bfabc56-116d-4db4-ba16-77d2f5699ca5'
--* get user organizations
SELECT
	*
FROM
	utils.fn_get_usr_orgs((
		SELECT
			usr_uuid
		FROM usrs.v_usr_org LIMIT 1)::UUID);

--* get organization id
--1000
SELECT
	utils._fn_get_org_id('1bfabc56-116d-4db4-ba16-77d2f5699ca5'::UUID);

- 1002
SELECT
	utils._fn_get_org_id('fcaa50a6-d953-424d-a770-fd0f0785a77e'::UUID);

--* assert user authorized in organization
SELECT
	utils._fn_assert_usr_org_auth(1001 , 1000);

SELECT
	utils._fn_assert_usr_org_auth(1001 , 1002);

--* set app context
DO $$
DECLARE
	_usr_id INTEGER;
	_org_id INTEGER;
	_data_keys TEXT[] := _is_context_set BOOLEAN;
BEGIN
	SET ROLE service_role;
	SELECT
		* INTO _usr_id
		, _org_id
		, _is_context_set
	FROM
		utils._fn_set_app_context('7377c9df-4fa9-4b4d-b1d9-1877d2711e9a' , '1bfabc56-116d-4db4-ba16-77d2f5699ca5');
	RESET ROLE;
END
$$;

--
----
-- ROLLBACK;
----
----
SELECT
	*
FROM
	usrs.v_usr_org;

SELECT
	*
FROM
	orgs.org;

SELECT
	*
FROM
	items.item_class;

--* create item class
SELECT
	*
FROM
	utils.fn_create_item_class(jsonb_build_object('_usr_uuid' , '7377c9df-4fa9-4b4d-b1d9-1877d2711e9a' , '_org_uuid' , '1bfabc56-116d-4db4-ba16-77d2f5699ca5' , '_item_class_name' , 'class1' , '_item_class_desc' , 'text1 text text text text'));

-- ROLLBACK
--* get item class
SELECT
	*
FROM
	utils.fn_get_items_classes(jsonb_build_object('_usr_uuid' , '7377c9df-4fa9-4b4d-b1d9-1877d2711e9a' , '_org_uuid' , '1bfabc56-116d-4db4-ba16-77d2f5699ca5'));

SELECT
	*
FROM
	items.item_class;

SELECT
	*
FROM
	items.item;

DELETE FROM items.item_class
WHERE item_class_id > 12;

--* create location
SELECT
	* INTO _result
FROM
	utils.fn_create_location(jsonb_build_object('_usr_uuid' , '7377c9df-4fa9-4b4d-b1d9-1877d2711e9a' , '_org_uuid' , '1bfabc56-116d-4db4-ba16-77d2f5699ca5' , '_loc_name' , 'location1' , '_loc_desc' , 'text1 text text text text'));

RAISE NOTICE '_result: %' , _result;

RESET ROLE;

END $$;

--* get locations
SELECT
	*
FROM
	utils.fn_get_locations(jsonb_build_object('_usr_uuid' , '7377c9df-4fa9-4b4d-b1d9-1877d2711e9a' , '_org_uuid' , '1bfabc56-116d-4db4-ba16-77d2f5699ca5'));

-- SELECT
-- 	*
-- FROM
-- 	locations.location;
--* create bin
SELECT
	* INTO _result
FROM
	utils.fn_create_bin(jsonb_build_object('_usr_uuid' , '7377c9df-4fa9-4b4d-b1d9-1877d2711e9a' , '_org_uuid' , '1bfabc56-116d-4db4-ba16-77d2f5699ca5' , '_bin_name' , 'location1' , '_bin_desc' , 'text1 text text text text' , 'loc_id' , '1'));

RAISE NOTICE '_result: %' , _result;

RESET ROLE;

END $$;

SELECT
	*
FROM
	locations.bin;

--*get bins
SELECT
	*
FROM
	utils.fn_get_bins(jsonb_build_object('_usr_uuid' , '7377c9df-4fa9-4b4d-b1d9-1877d2711e9a' , '_org_uuid' , '1bfabc56-116d-4db4-ba16-77d2f5699ca5'));

SELECT
	*
FROM
	locations.bin;

SELECT
	json_build_object('bins' , json_agg(json_build_object('bin_id' , t.bin_id , 'bin_name' , t.bin_name 'bin_desc' , t.bin_desc)))
FROM
	locations.bin t;

SELECT
	json_build_object('locations' , json_agg(json_build_object('loc_id' , t.loc_id , 'loc_name' , t.loc_name , 'loc_desc' , t.loc_desc)))
FROM
	locations.location t;

--*create market type
--*get market types
SELECT
	*
FROM
	markets.market_type;

--* market
SELECT
	*
FROM
	markets.market;

--* item class
SELECT
	*
FROM
	items.item_class;

--* ## items
SELECT
	*
FROM
	items.item;

--* transaction types
SELECT
	*
FROM
	trans.trx_type;

SELECT
	*
FROM
	jsonb_pretty(utils.fn_get_trx_types(jsonb_build_object('_usr_uuid' ,(
					SELECT
						u.usr_uuid
					FROM usrs.usr u
					WHERE
						u.usr_name = 'sa')::TEXT , '_org_uuid' ,(
					SELECT
						o.org_uuid
					FROM orgs.org o
					WHERE
						o.org_name = 'test_org5')::TEXT))::JSONB);

--* item transactions
SELECT
	*
FROM
	trans.item_trx;

------
--* item transaction details
--line details
---
DO $$
DECLARE
	-- _data JSONB;
	_data JSONB := ' {"_org_uuid" :"d20ad64c-7d77-4028-b0a3-fb45ba6b37eb"
	, "_usr_uuid" :"44c3a261-1fc0-4199-be80-eaf721f7eaa2"
	, "_trx_header" : { "_trx_date" :"7/1/2025"
	, "_trx_desc" :"kjhskjdhfsdkh"
	, "_market_id" :"1000"
	, "_trx_type_id" :"1002"
	, "_num_of_lines" :"2" }
	, "_trx_details" :[{ "_trx_line_num" :"1" , "_to_bin" :"1001" , "_item_id" :"1000" , "_from_bin" :"1002" , "_qty_in" :1.0 , "_qty_out" :1.0 , "_item_trx_desc" :"sdkkfjhkajsdfadsfad" } , { "_trx_line_num" :"2" , "_to_bin" :"1001" , "_item_id" :"1000" , "_from_bin" :"1002" , "_qty_in" :1.0 , "_qty_out" :1.0 , "_item_trx_desc" :"sdkkfjhkajsdfadsfad" }] }'::JSONB;
	_results JSONB;
	_type_id INTEGER;
	_trx_direction_id INTEGER;
BEGIN
	PERFORM
		utils.fn_create_item_trx(_data);

END;

$$;

ROLLBACK
----------
--------
------
---
SELECT
	*
FROM
	trans.item_trx;

SELECT
	*
FROM
	trans.item_trx_detail;

SELECT
	*
FROM
	items.item_qty;

SELECT
	*
FROM
	usrs.v_usr_org;

SELECT
	i.item_id
	, i.item_desc
	, i.item_class_id
	, c.item_class_name
	, c.item_class_desc
	, sum(q.item_qty) AS QOH
FROM
	items.item i
	JOIN items.item_class c ON i.item_class_id = c.item_class_id
	LEFT JOIN items.item_qty q ON i.item_id = q.item_id
GROUP BY
	i.item_id
	, i.item_desc
	, i.item_class_id
	, c.item_class_name
	, c.item_class_desc;
