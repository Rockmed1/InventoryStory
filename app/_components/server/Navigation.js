import Logo from "@/app/_components/server/Logo";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "../_ui/client/shadcn-Button";

export default async function Navigation() {
  // const user = await currentUser();
  // console.log("user: ", user);
  return (
    <div className="w-100% col-span-2 m-auto mx-2.5 flex items-center justify-between rounded-xl border-b-[0.5] border-neutral-300 bg-neutral-100 p-2 shadow-xs">
      <Logo />
      <input type="text" placeholder="Search Item..." className="input" />

      <ul className="sm:text-md flex items-center justify-between gap-2 font-semibold text-slate-700 sm:gap-4">
        <li>
          <SignedOut>
            <div className="flex items-center justify-between gap-2">
              <SignInButton>
                <Button>Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button>Sign Up</Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton showName />
            {/* <SignOutButton redirectUrl="/landing" /> */}
          </SignedIn>
        </li>
      </ul>
    </div>
  );
}
