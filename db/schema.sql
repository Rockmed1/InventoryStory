--CREATE DATABASE
-- DROP DATABASE if EXISTS testdb;
-- CREATE DATABASE testdb template template1;
----------
-- WITH SCHEMA-----
-----
RESET ROLE;

SELECT
	"current_user"();

DROP SCHEMA IF EXISTS utils CASCADE;

CREATE SCHEMA IF NOT EXISTS utils;

DROP SCHEMA IF EXISTS usrs CASCADE;

CREATE SCHEMA IF NOT EXISTS usrs;

DROP SCHEMA IF EXISTS orgs CASCADE;

CREATE SCHEMA IF NOT EXISTS orgs;

DROP SCHEMA IF EXISTS items CASCADE;

CREATE SCHEMA IF NOT EXISTS items;

DROP SCHEMA IF EXISTS locations CASCADE;

CREATE SCHEMA IF NOT EXISTS locations;

DROP SCHEMA IF EXISTS markets CASCADE;

CREATE SCHEMA IF NOT EXISTS markets;

DROP SCHEMA IF EXISTS trans CASCADE;

CREATE SCHEMA IF NOT EXISTS trans;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS usrs.usr;

CREATE TABLE IF NOT EXISTS usrs.usr(
	usr_id INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1000) PRIMARY KEY
	, usr_uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE
	, usr_name VARCHAR(20) NOT NULL UNIQUE
	, first_name VARCHAR(50) NOT NULL
	, last_name VARCHAR(50) NOT NULL
	, email VARCHAR(100)
	, created_by INTEGER NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	-- PRIMARY KEY (usr_id)
	--FOREIGN key (usr_id) REFERENCES usrs.usr (usr_id)
);

-- First usr
INSERT INTO usrs.usr(
	usr_name
	, first_name
	, last_name
	, created_by)
VALUES (
	'sa'
	, 'System'
	, 'Admin'
	, 1);

UPDATE
	usrs.usr
SET
	created_by =(
		SELECT
			usr_id
		FROM
			usrs.usr
		LIMIT 1)
WHERE
	1 = 1;

ALTER TABLE usrs.usr
	ADD CONSTRAINT fk_usr_to_usr_created_by FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id);

ALTER TABLE usrs.usr
	ADD CONSTRAINT fk_usr_to_usr_modified_by FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id);

ALTER TABLE usrs.usr ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS orgs.org;

CREATE TABLE IF NOT EXISTS orgs.org(
	org_id INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 1000) PRIMARY KEY
	, org_uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE
	, org_name VARCHAR(50) NOT NULL UNIQUE
	, org_desc TEXT NULL
	, created_by INTEGER NOT NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	, FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id)
);

ALTER TABLE orgs.org ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS usrs.usr_org;

CREATE TABLE IF NOT EXISTS usrs.usr_org(
	usr_org_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY
	, org_id INTEGER NOT NULL
	, usr_id INTEGER NOT NULL
	, active BOOL NOT NULL DEFAULT TRUE
	, created_by INTEGER NOT NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER DEFAULT NULL
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	, FOREIGN KEY (org_id) REFERENCES orgs.org(org_id)
	, FOREIGN KEY (usr_id) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id)
);

ALTER TABLE usrs.usr_org ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS locations.location;

CREATE TABLE IF NOT EXISTS locations.location(
	loc_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1000) UNIQUE
	, loc_name VARCHAR(50) NOT NULL
	, loc_desc TEXT NULL
	, org_id INTEGER NOT NULL
	, created_by INTEGER NOT NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER DEFAULT NULL
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	, FOREIGN KEY (org_id) REFERENCES orgs.org(org_id)
	, FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id)
	, PRIMARY KEY (loc_id , org_id)
	, UNIQUE (loc_name , org_id)
);

ALTER TABLE locations.location ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS locations.bin;

CREATE TABLE IF NOT EXISTS locations.bin(
	bin_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1000) UNIQUE
	, bin_name VARCHAR(50) NOT NULL
	, bin_desc TEXT NULL
	, loc_id INTEGER NOT NULL
	, org_id INTEGER NOT NULL
	, created_by INTEGER NOT NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER DEFAULT NULL
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	, FOREIGN KEY (loc_id , org_id) REFERENCES locations.location(loc_id , org_id)
	, FOREIGN KEY (org_id) REFERENCES orgs.org(org_id)
	, FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id)
	, PRIMARY KEY (bin_id , org_id)
	, UNIQUE (bin_name , org_id)
);

ALTER TABLE locations.bin ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS items.item_class;

CREATE TABLE IF NOT EXISTS items.item_class(
	item_class_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1000) UNIQUE
	, item_class_name VARCHAR(50) NOT NULL
	, item_class_desc TEXT NULL
	, org_id INTEGER NOT NULL
	, created_by INTEGER NOT NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER DEFAULT NULL
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	, FOREIGN KEY (org_id) REFERENCES orgs.org(org_id)
	, FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id)
	, PRIMARY KEY (item_class_id , org_id)
	, UNIQUE (item_class_name , org_id)
);

ALTER TABLE items.item_class ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS items.item;

CREATE TABLE IF NOT EXISTS items.item(
	item_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1000) UNIQUE
	, item_name VARCHAR(100)
	, item_desc TEXT NULL
	--, SKU default no sku
	--, hold boolean default false
	--, status active etc.
	, item_class_id INTEGER NOT NULL
	, org_id INTEGER NOT NULL
	, created_by INTEGER NOT NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER DEFAULT NULL
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	, FOREIGN KEY (item_class_id , org_id) REFERENCES items.item_class(item_class_id , org_id)
	, FOREIGN KEY (org_id) REFERENCES orgs.org(org_id)
	, FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id)
	, PRIMARY KEY (item_id , org_id)
	, UNIQUE (item_name , org_id)
);

ALTER TABLE items.item ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS items.item_qty;

CREATE TABLE IF NOT EXISTS items.item_qty(
	item_qty_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE
	, item_id BIGINT NOT NULL
	, bin_id INTEGER NOT NULL
	, item_qty DECIMAL(8 , 2) NOT NULL
	, org_id INTEGER NOT NULL
	, created_by INTEGER NOT NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER DEFAULT NULL
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	, FOREIGN KEY (item_id , org_id) REFERENCES items.item(item_id , org_id)
	, FOREIGN KEY (bin_id , org_id) REFERENCES locations.bin(bin_id , org_id)
	, FOREIGN KEY (org_id) REFERENCES orgs.org(org_id)
	, FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id)
	, PRIMARY KEY (item_id , bin_id , org_id)
);

ALTER TABLE items.item_qty ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS markets.market_type;

CREATE TABLE IF NOT EXISTS markets.market_type(
	market_type_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1000) UNIQUE
	, market_type_name VARCHAR(50) NOT NULL UNIQUE
	, market_type_desc TEXT NULL
	, org_id INTEGER NOT NULL
	, created_by INTEGER NOT NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER DEFAULT NULL
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	, FOREIGN KEY (org_id) REFERENCES orgs.org(org_id)
	, FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id)
	, PRIMARY KEY (market_type_id , org_id)
	, UNIQUE (market_type_name , org_id)
);

COMMENT ON TABLE markets.market_type IS 'procurement/ sales';

ALTER TABLE markets.market_type ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS markets.market;

CREATE TABLE IF NOT EXISTS markets.market(
	market_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1000) UNIQUE
	, market_name VARCHAR(50) NOT NULL UNIQUE
	, market_desc TEXT NULL
	, market_url VARCHAR(100)
	, market_type_id INTEGER NOT NULL
	, org_id INTEGER NOT NULL
	, created_by INTEGER NOT NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER DEFAULT NULL
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	, FOREIGN KEY (market_type_id , org_id) REFERENCES markets.market_type(market_type_id , org_id)
	, FOREIGN KEY (org_id) REFERENCES orgs.org(org_id)
	, FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id)
	, PRIMARY KEY (market_id , org_id)
	, UNIQUE (market_name , org_id)
);

ALTER TABLE markets.market ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS trans.trx_direction;

CREATE TABLE IF NOT EXISTS trans.trx_direction(
	trx_direction_id SMALLINT NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE
	, trx_direction TEXT NOT NULL
	, PRIMARY KEY (trx_direction_id)
);

--static trx directions
INSERT INTO trans.trx_direction(
	trx_direction)
VALUES (
	'in')
,(
	'out')
,(
	'in-out');

ALTER TABLE markets.market ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS trans.trx_type;

CREATE TABLE IF NOT EXISTS trans.trx_type(
	trx_type_id INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1000) UNIQUE
	, trx_type_name VARCHAR(50) NOT NULL
	, trx_type_desc TEXT NULL
	, trx_direction_id SMALLINT NOT NULL
	, org_id INTEGER NOT NULL
	, created_by INTEGER NOT NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER DEFAULT NULL
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	, FOREIGN KEY (trx_direction_id) REFERENCES trans.trx_direction(trx_direction_id)
	, FOREIGN KEY (org_id) REFERENCES orgs.org(org_id)
	, FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id)
	, PRIMARY KEY (trx_type_id , org_id)
	, UNIQUE (trx_type_name , org_id)
);

ALTER TABLE trans.trx_type ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS trans.item_trx;

CREATE TABLE IF NOT EXISTS trans.item_trx(
	item_trx_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 10000) UNIQUE
	, trx_type_id INTEGER NOT NULL
	, trx_date DATE NOT NULL
	, trx_desc TEXT
	, market_id INTEGER
	, num_of_lines INTEGER
	, org_id INTEGER NOT NULL
	, created_by INTEGER NOT NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER DEFAULT NULL
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	, FOREIGN KEY (trx_type_id , org_id) REFERENCES trans.trx_type(trx_type_id , org_id)
	, FOREIGN KEY (market_id , org_id) REFERENCES markets.market(market_id , org_id)
	, FOREIGN KEY (org_id) REFERENCES orgs.org(org_id)
	, FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id)
	, PRIMARY KEY (item_trx_id , org_id)
);

ALTER TABLE trans.item_trx ENABLE ROW LEVEL SECURITY;

DROP TABLE IF EXISTS trans.item_trx_detail;

CREATE TABLE IF NOT EXISTS trans.item_trx_detail(
	item_trx_detail_id BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 10000) UNIQUE
	, item_trx_id BIGINT NOT NULL
	, trx_line_num INTEGER NOT NULL
	, item_id BIGINT NOT NULL
	, from_bin_id INTEGER NULL
	, to_bin_id INTEGER NULL
	, qty_in DECIMAL(8 , 2) NULL
	, qty_out DECIMAL(8 , 2) NULL
	, item_trx_desc TEXT
	, org_id INTEGER NOT NULL
	, created_by INTEGER NOT NULL
	, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	, modified_by INTEGER DEFAULT NULL
	, modified_at TIMESTAMPTZ DEFAULT NOW()
	, exec_by VARCHAR(50) NOT NULL DEFAULT CURRENT_USER
	, FOREIGN KEY (item_trx_id , org_id) REFERENCES trans.item_trx(item_trx_id , org_id)
	, FOREIGN KEY (item_id , org_id) REFERENCES items.item(item_id , org_id)
	, FOREIGN KEY (from_bin_id , org_id) REFERENCES locations.bin(bin_id , org_id)
	, FOREIGN KEY (to_bin_id , org_id) REFERENCES locations.bin(bin_id , org_id)
	, FOREIGN KEY (org_id) REFERENCES orgs.org(org_id)
	, FOREIGN KEY (created_by) REFERENCES usrs.usr(usr_id)
	, FOREIGN KEY (modified_by) REFERENCES usrs.usr(usr_id)
	, PRIMARY KEY (item_trx_detail_id , org_id)
	, CHECK (NOT (from_bin_id IS NULL AND to_bin_id IS NULL))
	, CHECK (NOT (qty_in IS NULL AND qty_out IS NULL))
);

ALTER TABLE trans.item_trx_detail ENABLE ROW LEVEL SECURITY;

-- First test company
DO $$
BEGIN
	INSERT INTO orgs.org(
		org_name
		, created_by)
	VALUES(
		'test_co'
		,(
			SELECT
				usr_id
			FROM
				usrs.usr
			WHERE
				usr_name = 'sa'));
END
$$;

-- assign first usr to first company
DO $$
DECLARE
	_org_id INTEGER;
	_usr_id INTEGER;
BEGIN
	SELECT
		org_id INTO _org_id
	FROM
		orgs.org
	WHERE
		org_name = 'test_co';
	SELECT
		usr_id INTO _usr_id
	FROM
		usrs.usr
	WHERE
		usr_name = 'sa';
	INSERT INTO usrs.usr_org(
		org_id
		, usr_id
		, created_by)
	VALUES (
		_org_id
		, _usr_id
		, _usr_id);
END
$$
LANGUAGE plpgsql;
