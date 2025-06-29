RESET ROLE;

SELECT
	"current_user"();

-- DROP VIEW usrs.v_usr_org;
CREATE OR REPLACE VIEW usrs.v_usr_org AS
SELECT
	u.usr_id
	, u.usr_uuid
	, u.usr_name
	, o.org_id
	, o.org_uuid
	, o.org_name
FROM
	usrs.usr_org uo
	JOIN usrs.usr u ON uo.usr_id = u.usr_id
	JOIN orgs.org o ON uo.org_id = o.org_id;

-------------
----------
-------
-----
---
--
DROP VIEW IF EXISTS items.v_item;

CREATE OR REPLACE VIEW items.v_item AS
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
	, i.item_name
	, i.item_desc
	, i.item_class_id
	, c.item_class_name
	, c.item_class_desc;

----------------
--------------
-----------
--------
-----
---
DROP VIEW IF EXISTS locations.v_location;

CREATE OR REPLACE VIEW locations.v_location AS
SELECT
	l.loc_id
	, l.loc_name
	, l.loc_desc
FROM
	locations.location l;

----------------
--------------
-----------
--------
-----
---
DROP VIEW IF EXISTS locations.v_bin;

CREATE OR REPLACE VIEW locations.v_bin AS
SELECT
	b.bin_id
	, b.bin_name
	, l.loc_name
	, b.bin_desc
FROM
	locations.bin b
	JOIN locations.location l ON l.loc_id = b.loc_id;

----------------
--------------
-----------
--------
-----
---
DROP VIEW IF EXISTS items.v_item_class;

CREATE OR REPLACE VIEW items.v_item_class AS
SELECT
	c.item_class_id
	, c.item_class_name
	, c.item_class_desc
FROM
	items.item_class c;

----------------
--------------
-----------
--------
-----
---
DROP VIEW IF EXISTS markets.v_market_type;

CREATE OR REPLACE VIEW markets.v_market_type AS
SELECT
	t.market_type_id
	, t.market_type_name
	, t.market_type_desc
FROM
	markets.market_type t;

----------------
--------------
-----------
--------
-----
---
DROP VIEW IF EXISTS markets.v_market;

CREATE OR REPLACE VIEW markets.v_market AS
SELECT
	m.market_id
	, m.market_name
	, t.market_type_name
	, m.market_desc
	, m.market_url
FROM
	markets.market m
	JOIN markets.market_type t ON m.market_type_id = t.market_type_id;

----------------
--------------
-----------
--------
-----
---
DROP VIEW IF EXISTS trans.v_trx_type;

CREATE OR REPLACE VIEW trans.v_trx_type AS
SELECT
	t.trx_type_id
	, t.trx_type_name
	, d.trx_direction
	, t.trx_type_desc
FROM
	trans.trx_type t
	JOIN trans.trx_direction d ON t.trx_direction_id = d.trx_direction_id;
