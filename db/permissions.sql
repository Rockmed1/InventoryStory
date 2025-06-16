/* 
Use anon for public access to resources.
Use authenticator for authenticated (in supabase) usrs  with limited access.
Use supabase_admin for administrative tasks and backend services.
!Use service_role for server-side operations that require elevated permissions. 
!Use utils_admin to create functions as security definer so that rls is not bypassed if we invoke the functions by the service_role.
utils_admin will have select, update, insert, delete, execute permission on all schemas
service_role will hace execute permission on utils schema only. 
 */
-----
-----
-----> For non supabase postgres initialization we need to create a sercive_role to make testing the code easier:
-----
/* Create the service_role */
-- DO $$
-- BEGIN
-- 	IF NOT EXISTS(
-- 		SELECT
-- 			*
-- 		FROM
-- 			pg_roles
-- 		WHERE
-- 			rolname = 'service_role') THEN
-- 	CREATE ROLE service_role NOLOGIN;
-- END IF;
-- END
-- $$;
---------
-- DROP ROLE service_role;
----
-- GRANT USAGE ON SCHEMA utils TO utils_admin;
-- GRANT CREATE ON SCHEMA utils TO utils_admin;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA utils TO utils_admin;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA utils TO service_role;
-- GRANT SELECT , INSERT , UPDATE , DELETE ON ALL TABLES IN SCHEMA utils TO utils_admin;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA utils GRANT
-- SELECT
-- 	, INSERT , UPDATE , DELETE ON TABLES TO utils_admin;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA utils GRANT EXECUTE ON FUNCTIONS TO utils_admin;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA utils GRANT EXECUTE ON FUNCTIONS TO service_role;
---
---
RESET ROLE;

SELECT
	"current_user"();


/* Create the utils_admin role */
DO $$
BEGIN
	IF NOT EXISTS(
		SELECT
			*
		FROM
			pg_roles
		WHERE
			rolname = 'utils_admin') THEN
	CREATE ROLE utils_admin NOLOGIN;

END IF;
END
$$;


/* -- needed to assign function ownership */
-- GRANT utils_admin TO aa;
GRANT utils_admin TO postgres;

GRANT CREATE ON SCHEMA utils TO utils_admin;


/*  --needed so that the api can access and execute the functions */
GRANT USAGE ON SCHEMA utils TO service_role;


/* 
give utils_admin access to all app schemas
 */
DO $$
DECLARE
	_role TEXT;
	_scm TEXT;
BEGIN
	_role = 'utils_admin';
	FOR _scm IN (
		SELECT
			schema_name
		FROM
			information_schema.schemata
		WHERE
			schema_name NOT IN ('public' , 'information_schema' , 'vault' , 'extensions' , 'auth' , 'storage' , 'users' , 'realtime')
			AND schema_name NOT LIKE 'pg%'
			AND schema_name NOT LIKE 'graphql%')
		LOOP
			RAISE NOTICE 'Granting % prtmissions on schema %' , _role , _scm;
			EXECUTE FORMAT($f$ GRANT USAGE ON SCHEMA %I TO %I;
			GRANT SELECT , INSERT , UPDATE , DELETE ON ALL TABLES IN SCHEMA %I TO %I;
			GRANT ALL ON ALL SEQUENCES IN SCHEMA %I TO %I;
			GRANT EXECUTE ON ALL ROUTINES IN SCHEMA %I TO %I;
			ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA %I GRANT
			SELECT
				, INSERT , UPDATE , DELETE ON TABLES TO %I;
			ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA %I GRANT ALL ON SEQUENCES TO %I;
			ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA %I GRANT EXECUTE ON ROUTINES TO %I;
			$f$
			, _scm
			, _role
			, _scm
			, _role
			, _scm
			, _role
			, _scm
			, _role
			, _scm
			, _role
			, _scm
			, _role
			, _scm
			, _role);
		END LOOP;
END;
$$
LANGUAGE plpgsql;

-------
----------
----
---
----
--
/* 
set up rls policies on app tables
 */
-----
DO $$
DECLARE
	_scm TEXT;
	_tbl TEXT;
BEGIN
	FOR _scm
	, _tbl IN (
		SELECT
			table_schema
			, table_name
		FROM
			information_schema.tables
		WHERE
			table_schema NOT IN ('public' , 'information_schema' , 'vault' , 'extensions' , 'auth' , 'storage' , 'users' , 'realtime' , 'usrs' , 'orgs')
			AND table_schema NOT LIKE 'pg%'
			AND table_schema NOT LIKE 'graphql%'
			AND table_type = 'BASE TABLE'
			AND table_name <> 'trx_direction')
		LOOP
			RAISE NOTICE '____*** Creating policies for %.% *****____' , _scm , _tbl;
			RAISE NOTICE 'SELECT policy for %.%:' , _scm , _tbl;
			EXECUTE FORMAT($f$ DROP POLICY IF EXISTS "Org_select_policy" ON %I.%I;
			CREATE POLICY "Org_select_policy" ON %I.%I AS PERMISSIVE
				FOR SELECT TO public
					USING (org_id = nullif(CURRENT_SETTING('rls.org_id' , TRUE ) , '' )::INT );
			$f$
			, _scm
			, _tbl
			, _scm
			, _tbl);
			RAISE NOTICE 'DELETE policy for %.%:' , _scm , _tbl;
			EXECUTE FORMAT($f$ DROP POLICY IF EXISTS "Org_delete_policy" ON %I.%I;
			CREATE POLICY "Org_delete_policy" ON %I.%I AS PERMISSIVE
				FOR DELETE TO public
					USING (org_id = nullif(CURRENT_SETTING('rls.org_id' , TRUE ) , '' )::INT );
			$f$
			, _scm
			, _tbl
			, _scm
			, _tbl);
			RAISE NOTICE 'INSERT policy for %.%:' , _scm , _tbl;
			EXECUTE FORMAT($f$ DROP POLICY IF EXISTS "Org_insert_policy" ON %I.%I;
			CREATE POLICY "Org_insert_policy" ON %I.%I AS PERMISSIVE
				FOR INSERT TO public
					WITH CHECK (org_id = CURRENT_SETTING(
					'rls.org_id' , TRUE )::INT );
	$f$
	, _scm
	, _tbl
	, _scm
	, _tbl);
	RAISE NOTICE 'UPDATE policy for %.%:' , _scm , _tbl;
	EXECUTE FORMAT($f$ DROP POLICY IF EXISTS "Org_update_policy" ON %I.%I;
	CREATE POLICY "Org_update_policy" ON %I.%I AS PERMISSIVE
		FOR UPDATE TO public
			USING (org_id = nullif(CURRENT_SETTING('rls.org_id' , TRUE ) , '' )::INT )
			WITH CHECK (org_id = nullif(CURRENT_SETTING('rls.org_id' , TRUE ) , '' )::INT );
	$f$
	, _scm
	, _tbl
	, _scm
	, _tbl);
END LOOP;
END;
$$
LANGUAGE plpgsql;

----------
----
---
----
--
/* 
set up rls policies on usrs and orgs tables
 */
DO $$
DECLARE
	_scm TEXT;
	_tbl TEXT;
BEGIN
	FOR _scm
	, _tbl IN (
		SELECT
			table_schema
			, table_name
		FROM
			information_schema.tables
		WHERE
			table_schema IN ('usrs' , 'orgs')
			AND table_type = 'BASE TABLE')
		LOOP
			RAISE NOTICE '____*** Creating policies for %.% *****____' , _scm , _tbl;
			RAISE NOTICE 'SELECT policy for %.%:' , _scm , _tbl;
			EXECUTE FORMAT($f$ DROP POLICY IF EXISTS "Org_select_policy" ON %I.%I;
			CREATE POLICY "Org_select_policy" ON %I.%I AS PERMISSIVE
				FOR SELECT TO public
					USING (TRUE );
			$f$
			, _scm
			, _tbl
			, _scm
			, _tbl);
			RAISE NOTICE 'DELETE policy for %.%:' , _scm , _tbl;
			EXECUTE FORMAT($f$ DROP POLICY IF EXISTS "Org_delete_policy" ON %I.%I;
			CREATE POLICY "Org_delete_policy" ON %I.%I AS PERMISSIVE
				FOR DELETE TO public
					USING (TRUE );
			$f$
			, _scm
			, _tbl
			, _scm
			, _tbl);
			RAISE NOTICE 'INSERT policy for %.%:' , _scm , _tbl;
			EXECUTE FORMAT($f$ DROP POLICY IF EXISTS "Org_insert_policy" ON %I.%I;
			CREATE POLICY "Org_insert_policy" ON %I.%I AS PERMISSIVE
				FOR INSERT TO public
					WITH CHECK (TRUE );
	$f$
	, _scm
	, _tbl
	, _scm
	, _tbl);
	RAISE NOTICE 'UPDATE policy for %.%:' , _scm , _tbl;
	EXECUTE FORMAT($f$ DROP POLICY IF EXISTS "Org_update_policy" ON %I.%I;
	CREATE POLICY "Org_update_policy" ON %I.%I AS PERMISSIVE
		FOR UPDATE TO public
			USING (TRUE )
			WITH CHECK (TRUE );
	$f$
	, _scm
	, _tbl
	, _scm
	, _tbl);
END LOOP;
END;
$$
LANGUAGE plpgsql;

--clean up permissions on trx_direction table:
REVOKE INSERT , UPDATE , DELETE ON trans.trx_direction FROM utils_admin;

DROP POLICY IF EXISTS "Org_select_policy" ON trans.trx_direction;

CREATE POLICY "Org_select_policy" ON trans.trx_direction AS PERMISSIVE
	FOR SELECT TO public
		USING (TRUE);

