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
'1000	2bfdec48-d917-41ee-99ff-123757d59df1	sa	1000	test_co ceba721b-b8dc-487d-a80c-15ae9d947084
1000	2bfdec48-d917-41ee-99ff-123757d59df1	sa	1002	test_co2 aadb7c11-b96a-495d-86a3-31e3ab4deabe
1001	155b29b7-375a-407f-8168-f2090d61518e	test_usr2	1000	test_co ceba721b-b8dc-487d-a80c-15ae9d947084'
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
	utils._fn_get_org_id('ceba721b-b8dc-487d-a80c-15ae9d947084'::UUID);

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
		utils._fn_set_app_context('2bfdec48-d917-41ee-99ff-123757d59df1' , 'ceba721b-b8dc-487d-a80c-15ae9d947084');
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
	utils.fn_create_item_class(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084' , '_item_class_name' , 'class1' , '_item_class_desc' , 'text1 text text text text'));

-- ROLLBACK
--* get item class
SELECT
	*
FROM
	utils.fn_get_items_classes(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084'));

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
DO $$
DECLARE
	_result JSON;
BEGIN
	SELECT
		* INTO _result
	FROM
		utils.fn_create_location(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084' , '_loc_name' , 'api_2' , '_loc_desc' , 'text1 text text text text'));

	RAISE NOTICE '_result: %' , _result;

END
$$;

--* get locations
SELECT
	*
FROM
	utils.fn_get_locations(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084'));

-- DELETE FROM locations.location
-- -- WHERE location.loc_name LIKE 'api%'
-- WHERE location.loc_id = 1030
-- SELECT
-- 	*
-- FROM
-- 	locations.v_location;
--* create bin
SELECT
	* INTO _result
FROM
	utils.fn_create_bin(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084' , '_bin_name' , 'location1' , '_bin_desc' , 'text1 text text text text' , 'loc_id' , '1'));

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
	utils.fn_get_bins(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084'));

SELECT
	*
FROM
	locations.v_bin;

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

SELECT
	*
FROM
	utils.fn_get_market_types(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084'));

--* market
SELECT
	*
FROM
	markets.market;

SELECT
	*
FROM
	markets.v_market;

SELECT
	*
FROM
	utils.fn_get_markets(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084'));

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

SELECT
	*
FROM
	utils.fn_get_items(jsonb_build_object('_item_id' , '1000' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084' , '_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1'));

DELETE FROM items.item
WHERE item.item_id = 1037
	WHERE item.item_name LIKE 'api%';

--* transaction types
SELECT
	*
FROM
-- trans.trx_type;
trans.v_trx_type;

SELECT
	*
FROM
	utils.fn_update_trx_type(jsonb_build_object('_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084' , '_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_trx_type_id' , '1000' , '_trx_type_name' , 'trx_Type15' , '_trx_type_desc' , 'text1 text text text text' , '_trx_direction_id' , 1));

SELECT
	org_id
	, org_name
FROM
	orgs.org
WHERE
	org_uuid = 'ceba721b-b8dc-487d-a80c-15ae9d947084';

SELECT
	trx_type_id
	, trx_type_name
	, org_id
FROM
	trans.trx_type
WHERE
	trx_type_id = 1000;

SELECT
	*
FROM
	trans.trx_direction;

SELECT
	*
FROM
	utils.fn_get_trx_types(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084'));

SELECT
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

UPDATE
	locations.location
SET
	loc_name = 'api_test3'
	, loc_desc = 'lkhljhsfg'
WHERE
	loc_id = 898098;

SELECT
	utils.fn_update_location(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084' , '_loc_id' , '1033' , '_loc_name' , 'api_test4' , '_loc_desc' , 'lkjhkjhlasdf'));

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
	_data JSONB := ' {"_org_uuid" :"ceba721b-b8dc-487d-a80c-15ae9d947084"
	, "_usr_uuid" :"2bfdec48-d917-41ee-99ff-123757d59df1"
	, "_trx_header" : { "_trx_date" :"7/1/2025"
	, "_trx_desc" :"kjhskjdhfsdkh"
	, "_market_id" :"1000"
	, "_trx_type_id" :"1000"
	, "_num_of_lines" :"2" }
	, "_trx_details" :[{ "_trx_line_num" :"1" , "_to_bin_id" :"1001" , "_item_id" :"1000" , "_from_bin_id" :null , "_qty_in" :8.0 , "_qty_out" :null , "_item_trx_desc" :"sdkkfjhkajsdfadsfad" } , { "_trx_line_num" :"2" , "_to_bin_id" :"1001" , "_item_id" :"1001" , "_from_bin_id" :null , "_qty_in" :10.0 , "_qty_out" :null , "_item_trx_desc" :"sdkkfjhkajsdfadsfad" }] }'::JSONB;
	_results JSONB;
	_type_id INTEGER;
	_trx_direction_id INTEGER;
BEGIN
	PERFORM
		utils.fn_create_item_trx(_data);

END;

$$;

-- ALTER TABLE trans.item_trx_detail RENAME COLUMN from_bin TO from_bin_id;
-- ALTER TABLE trans.item_trx_detail RENAME COLUMN to_bin TO to_bin_id;
ROLLBACK;

SELECT
	' {"_org_uuid" :"ceba721b-b8dc-487d-a80c-15ae9d947084"
	, "_usr_uuid" :"2bfdec48-d917-41ee-99ff-123757d59df1"
	, "_trx_header" : { "_trx_date" :"7/1/2025"
	, "_trx_desc" :"kjhskjdhfsdkh"
	, "_market_id" :"1000"
	, "_trx_type_id" :"1000"
	, "_num_of_lines" :"2" }
	, "_trx_details" :[{ "_trx_line_num" :"1" , "_to_bin_id" :"1001" , "_item_id" :"1000" , "_from_bin_id" :null , "_qty_in" :8.0 , "_qty_out" :null , "_item_trx_desc" :"sdkkfjhkajsdfadsfad" } , { "_trx_line_num" :"2" , "_to_bin_id" :"1001" , "_item_id" :"1001" , "_from_bin_id" :null , "_qty_in" :10.0 , "_qty_out" :null , "_item_trx_desc" :"sdkkfjhkajsdfadsfad" }] }'::JSONB
	----------
	--------
	------
	---
	SELECT
		*
	FROM
		trans.item_trx;

SELECT
	t.item_trx_id
	, t.trx_date
	, t.trx_desc
	, t.trx_type_id
	, y.trx_type_name
	, d.trx_direction
	, t.market_id
	, m.market_name
	, m.market_url
FROM
	trans.item_trx t
	JOIN trans.trx_type y ON y.trx_type_id = t.trx_type_id
	JOIN trans.trx_direction d ON d.trx_direction_id = y.trx_direction_id
	JOIN markets.market m ON m.market_id = t.market_id;

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
	*
FROM
	items.v_item;

SELECT
	i.item_id
	, i.item_name
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

-- CREATE TABLE public."test"(
-- 	id INT
-- 	, name VARCHAR(255)
-- 	, status VARCHAR(50)
-- 	, "createdAt" TIMESTAMP
-- 	, "updatedAt" TIMESTAMP
-- );
-- DROP TABLE test;
SELECT
	utils.fn_get_item_trx_details(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084' , 'item_trx_id' , '10000'));

SELECT
	d.item_trx_detail_id
	, d.item_trx_id
	, d.trx_line_num
	, d.item_trx_desc
	, d.item_id
	, i.item_name
	, d.from_bin
	, b.bin_desc
	, d.to_bin
	, n.bin_desc
	, d.qty_in
	, d.qty_out
FROM
	trans.item_trx_detail d
	JOIN items.item i ON i.item_id = d.item_id
	LEFT JOIN locations.bin b ON b.bin_id = d.from_bin
	LEFT JOIN locations.bin n ON n.bin_id = d.to_bin;

SELECT
	*
FROM
	trans.v_item_trx_detail;

SELECT
	json_build_object('item_trx_id' , d.item_trx_id , 'item_trx_details' , json_agg(json_build_object('item_trx_detail_id' , d.item_trx_detail_id , 'trx_line_num' , d.trx_line_num , 'item_trx_desc' , d.item_trx_desc , 'item_id' , d.item_id , 'item_name' , d.item_name , 'from_bin' , d.from_bin , 'from_bin_desc' , d.from_bin_desc , 'to_bin' , d.to_bin , 'to_bin_desc' , d.to_bin_desc , 'qty_in' , d.qty_in , 'qty_out' , d.qty_out)))
FROM
	trans.v_item_trx_detail d
WHERE
	d.item_trx_id = 10000
GROUP BY
	d.item_trx_id;

-----------
--------
-----
---
--
SELECT
	*
FROM
	utils.fn_get_item_trans(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084'));

-----------
SELECT
	*
FROM
	utils.fn_get_item_trans(jsonb_build_object('_usr_uuid' , '2bfdec48-d917-41ee-99ff-123757d59df1' , '_org_uuid' , 'ceba721b-b8dc-487d-a80c-15ae9d947084' , 'item_trx_id' , '10000'));
