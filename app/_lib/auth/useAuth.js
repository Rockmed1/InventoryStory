import { redirect } from "next/navigation";

/**
 * @deprecated This is a temporary hook for development and should be replaced by a proper server-side authentication system.
 * Retrieves a static, hardcoded user and organization session object.
 * In a production environment, this should be replaced with a call to a real authentication provider (e.g., from NextAuth.js, Clerk, or your own session management).
 *
 * @returns {{_org_uuid: string, _usr_uuid: string}} The hardcoded session object.
 */

export default function UseAuth() {
  //1- authenticate the user
  const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
  const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";
  // const session = await auth();
  const session = { _org_uuid: ORG_UUID, _usr_uuid: USR_UUID };

  if (!session?._org_uuid || !session?._usr_uuid) return redirect("/");

  return session;
}
