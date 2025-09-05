"use client";

import { useClerkRedirectUrl } from "@/app/_utils/helpers-client";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  const redirectUrl = useClerkRedirectUrl();

  // console.log(redirectUrl);

  // console.log("sign in page about to call the sign in component");

  return (
    <div className="bg-muted flex w-full flex-1 items-center justify-center p-6 md:p-10">
      <SignIn forceRedirectUrl={redirectUrl} oauthFlow="popup" />
    </div>
  );
}
