CREATE TABLE bins (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  bin_description varchar(100) NOT NULL,
  location_id int NOT NULL,
  created_at timestamptz NOT NULL,
  created_by int NOT NULL,
  organization_id int NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE item_class (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  item_class_name varchar(50) NOT NULL UNIQUE,
  created_at timestamptz NOT NULL,
  created_by int NOT NULL,
  organization_id int NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE item_market (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  item_market_name varchar(50) NOT NULL UNIQUE,
  item_market_description varchar(120),
  item_market_url varchar(100),
  market_type_id int NOT NULL,
  created_by int NOT NULL,
  created_at timestamptz NOT NULL,
  organization_id int NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE item_quantity (
  id bigint NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  quantity int NOT NULL,
  created_at timestamptz NOT NULL,
  created_by int NOT NULL,
  item_id bigint NOT NULL,
  bin_id int NOT NULL,
  organization_id int NOT NULL,
  PRIMARY KEY (item_id, bin_id)
);

CREATE TABLE item_transactions (
  id bigint NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  item_transaction_type_id int NOT NULL,
  date date NOT NULL,
  created_by int NOT NULL,
  created_at timestamptz NOT NULL,
  organization_id int NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE item_transactions_details (
  id bigint NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  item_transaction_id bigint NOT NULL,
  item_id bigint NOT NULL,
  from_bin int NOT NULL,
  to_bin int NOT NULL,
  quantity_in float8 NOT NULL DEFAULT 0,
  quantity_out float8 DEFAULT 0,
  item_market_id int NOT NULL,
  item_transaction_detail varchar(120),
  created_at timestamptz NOT NULL,
  created_by int NOT NULL,
  organization_id int NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE items (
  id bigint NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  item_description varchar(120) NOT NULL UNIQUE,
  item_class_id int NOT NULL,
  created_at timestamptz NOT NULL,
  created_by int NOT NULL,
  organization_id int NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE locations (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  location_name varchar(50) NOT NULL UNIQUE,
  created_by int NOT NULL,
  created_at timestamptz NOT NULL,
  organization_id int NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE market_types (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  market_type_name varchar(50) NOT NULL UNIQUE,
  market_type_description varchar(120),
  created_at timestamptz NOT NULL,
  organization_id int NOT NULL,
  created_by int NOT NULL,
  PRIMARY KEY (id)
);

COMMENT ON TABLE market_types IS 'procurement/ sales';

CREATE TABLE organizations (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  organization_name varchar(50) NOT NULL UNIQUE,
  created_at timestamptz NOT NULL,
  created_by int NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE transaction_types (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  transaction_type_name varchar(50) NOT NULL UNIQUE,
  created_by int NOT NULL,
  created_at timestamptz NOT NULL,
  organization_id int NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE users (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  user_name varchar(20) NOT NULL UNIQUE,
  first_name varchar(50) NOT NULL,
  last_name varchar(50) NOT NULL,
  created_by int NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE users_organizations (
  id int NOT NULL GENERATED ALWAYS AS IDENTITY UNIQUE,
  organization_id int NOT NULL,
  user_id int NOT NULL,
  created_at timestamptz NOT NULL,
  created_by int NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE users_organizations ADD CONSTRAINT FK_organizations_TO_users_organizations FOREIGN KEY (organization_id) REFERENCES organizations (id);

ALTER TABLE users_organizations ADD CONSTRAINT FK_users_TO_users_organizations FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE items ADD CONSTRAINT FK_item_class_TO_items FOREIGN KEY (item_class_id) REFERENCES item_class (id);

ALTER TABLE item_transactions ADD CONSTRAINT FK_transaction_types_TO_item_transactions FOREIGN KEY (item_transaction_type_id) REFERENCES transaction_types (id);

ALTER TABLE item_transactions_details ADD CONSTRAINT FK_item_transactions_TO_item_transactions_details FOREIGN KEY (item_transaction_id) REFERENCES item_transactions (id);

ALTER TABLE item_transactions_details ADD CONSTRAINT FK_items_TO_item_transactions_details FOREIGN KEY (item_id) REFERENCES items (id);

ALTER TABLE item_transactions_details ADD CONSTRAINT FK_bins_TO_item_transactions_details FOREIGN KEY (from_bin) REFERENCES bins (id);

ALTER TABLE item_transactions_details ADD CONSTRAINT FK_bins_TO_item_transactions_details1 FOREIGN KEY (to_bin) REFERENCES bins (id);

ALTER TABLE item_transactions_details ADD CONSTRAINT FK_item_market_TO_item_transactions_details FOREIGN KEY (item_market_id) REFERENCES item_market (id);

ALTER TABLE item_quantity ADD CONSTRAINT FK_items_TO_item_quantity FOREIGN KEY (item_id) REFERENCES items (id);

ALTER TABLE item_quantity ADD CONSTRAINT FK_bins_TO_item_quantity FOREIGN KEY (bin_id) REFERENCES bins (id);

ALTER TABLE bins ADD CONSTRAINT FK_locations_TO_bins FOREIGN KEY (location_id) REFERENCES locations (id);

ALTER TABLE item_market ADD CONSTRAINT FK_market_types_TO_item_market FOREIGN KEY (market_type_id) REFERENCES market_types (id);

ALTER TABLE market_types ADD CONSTRAINT FK_organizations_TO_market_types FOREIGN KEY (organization_id) REFERENCES organizations (id);

ALTER TABLE item_market ADD CONSTRAINT FK_organizations_TO_item_market FOREIGN KEY (organization_id) REFERENCES organizations (id);

ALTER TABLE users_organizations ADD CONSTRAINT FK_users_TO_users_organizations1 FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE users ADD CONSTRAINT FK_users_TO_users FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE organizations ADD CONSTRAINT FK_users_TO_organizations FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE market_types ADD CONSTRAINT FK_users_TO_market_types FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE item_market ADD CONSTRAINT FK_users_TO_item_market FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE item_transactions ADD CONSTRAINT FK_users_TO_item_transactions FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE transaction_types ADD CONSTRAINT FK_users_TO_transaction_types FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE transaction_types ADD CONSTRAINT FK_organizations_TO_transaction_types FOREIGN KEY (organization_id) REFERENCES organizations (id);

ALTER TABLE items ADD CONSTRAINT FK_users_TO_items FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE item_transactions_details ADD CONSTRAINT FK_users_TO_item_transactions_details FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE item_class ADD CONSTRAINT FK_users_TO_item_class FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE locations ADD CONSTRAINT FK_users_TO_locations FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE bins ADD CONSTRAINT FK_users_TO_bins FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE item_quantity ADD CONSTRAINT FK_users_TO_item_quantity FOREIGN KEY (created_by) REFERENCES users (id);

ALTER TABLE item_transactions ADD CONSTRAINT FK_organizations_TO_item_transactions FOREIGN KEY (organization_id) REFERENCES organizations (id);

ALTER TABLE item_transactions_details ADD CONSTRAINT FK_organizations_TO_item_transactions_details FOREIGN KEY (organization_id) REFERENCES organizations (id);

ALTER TABLE items ADD CONSTRAINT FK_organizations_TO_items FOREIGN KEY (organization_id) REFERENCES organizations (id);

ALTER TABLE locations ADD CONSTRAINT FK_organizations_TO_locations FOREIGN KEY (organization_id) REFERENCES organizations (id);

ALTER TABLE bins ADD CONSTRAINT FK_organizations_TO_bins FOREIGN KEY (organization_id) REFERENCES organizations (id);

ALTER TABLE item_quantity ADD CONSTRAINT FK_organizations_TO_item_quantity FOREIGN KEY (organization_id) REFERENCES organizations (id);

ALTER TABLE item_class ADD CONSTRAINT FK_organizations_TO_item_class FOREIGN KEY (organization_id) REFERENCES organizations (id);
