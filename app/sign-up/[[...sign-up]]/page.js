"use client";

import { useSyncRedirectUrl } from "@/app/_utils/helpers-client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  const redirectUrl = useSyncRedirectUrl();

  return (
    <div className="bg-muted flex w-full flex-1 items-center justify-center p-6 md:p-10">
      <SignUp forceRedirectUrl={redirectUrl} oauthFlow="popup" />
    </div>
  );
}
