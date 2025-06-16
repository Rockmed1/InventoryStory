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
CREATE VIEW items.v_item AS
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
