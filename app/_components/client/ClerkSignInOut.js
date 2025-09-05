"use client";

import { useClerkRedirectUrl } from "@/app/_utils/helpers-client";
import {
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function ClerkSignInOut({ orgSelector = false }) {
  const redirectUrl = useClerkRedirectUrl();
  // console.log("sideNavigation redirectUrl:", redirectUrl);

  return (
    <>
      <SignedOut>
        <div className="flex items-center justify-between gap-2">
          <SignInButton>Sign In</SignInButton>
          <SignUpButton>Sign Up</SignUpButton>
        </div>
      </SignedOut>
      <SignedIn>
        <UserButton showName />
        {orgSelector && (
          <OrganizationSwitcher
            afterCreateOrganizationUrl={redirectUrl}
            afterSelectOrganizationUrl={redirectUrl}
          />
        )}
      </SignedIn>
    </>
  );
}
