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
	, b.loc_id
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
	, m.market_type_id
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

----------------
--------------
-----------
--------
-----
---
DROP VIEW IF EXISTS trans.v_item_trx;

CREATE OR REPLACE VIEW trans.v_item_trx AS
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

----------------
--------------
-----------
--------
-----
---
DROP VIEW IF EXISTS trans.v_item_trx_detail;

CREATE OR REPLACE VIEW trans.v_item_trx_detail AS
SELECT
	d.item_trx_detail_id
	, d.item_trx_id
	, d.trx_line_num
	, d.item_trx_desc
	, d.item_id
	, i.item_name
	, d.from_bin
	, b.bin_desc AS from_bin_desc
	, d.to_bin
	, n.bin_desc AS to_bin_desc
	, d.qty_in
	, d.qty_out
FROM
	trans.item_trx_detail d
	JOIN items.item i ON i.item_id = d.item_id
	LEFT JOIN locations.bin b ON b.bin_id = d.from_bin
	LEFT JOIN locations.bin n ON n.bin_id = d.to_bin;
