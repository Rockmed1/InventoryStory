"server only";

import { auth } from "@clerk/nextjs/server";

export default async function getAuthContext() {
  const {
    sessionId,
    sessionClaims,
    userId,
    orgId,
    orgSlug,
    isAuthenticated,
    redirectToSignIn,
  } = await auth();

  const { email, firstName, lastName, orgName, userName, userOrg } =
    sessionClaims;

  if (!isAuthenticated || !userId || !orgId) return redirectToSignIn();

  const session = {
    sessionId,
    userId,
    orgId,
    orgSlug,
    isAuthenticated,
    redirectToSignIn,
    email,
    firstName,
    lastName,
    orgName,
    userName,
    userOrg,
  };

  return session;
}
