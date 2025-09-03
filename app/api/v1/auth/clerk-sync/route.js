"server only";

import getAuthContext from "@/app/_lib/auth/getAuthContext";
import { clerkSync } from "@/app/_lib/data/server/actions";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

export async function GET(request) {
  // const Auth = await auth()

  const {
    userId,
    orgId,
    orgSlug,
    email,
    firstName,
    lastName,
    orgName,
    userName,
    userOrg,
  } = await getAuthContext();

  const _data = {
    _clerk_usr_data: {
      _usr_xid: userId,
      _email: email,
      _usr_name: userName,
      _first_name: firstName,
      _last_name: lastName,
    },
    _clerk_org_data: {
      _org_xid: orgId,
      _org_name: orgSlug,
      _org_desc: orgName,
    },
    _clerk_usr_org_data: Object.keys(userOrg),
  };

  // console.log(_data);

  const { searchParams } = new URL(request.url);
  const returnUrl = searchParams.get("return_url") || "/dashboard";
  //sync with db
  try {
    const { success, message } = await clerkSync(_data);

    // console.log(success, message);
    // if (!success) {
    //   //if db fail log the user out by revoking all the sessions
    //   const clerkSessions = await clerkClient.sessions.getSessionList({
    //     userId,
    //   });
    //   // console.log("clerkSessions: ", clerkSessions);

    //   clerkSessions.forEach(async (session) => {
    //     await clerkClient.sessions.revokeSession(session.id);
    //   });

    //   // const afterRevokeSessions = await clerkClient.sessions.getSessionList({
    //   //   userId,
    //   // });

    //   // console.log(afterRevokeSessions);
    //   //TODO: show a more descriptive error to the user to contact admin because of the sync issue...
    // }
  } catch (error) {
    console.error("🚨 clerk-sync error:", error);
    const clerkSessions = await clerkClient.sessions.getSessionList({
      userId,
    });
    // console.log("clerkSessions: ", clerkSessions);

    clerkSessions.forEach(async (session) => {
      await clerkClient.sessions.revokeSession(session.id);
    });

    return NextResponse.redirect(
      new URL("/errors/500", request.nextUrl.origin),
    );
  }

  return NextResponse.redirect(new URL(returnUrl, request.nextUrl.origin));
}
