import Logo from "@/app/_components/server/Logo";
import ClerkSignInOut from "../client/ClerkSignInOut";

export default async function Navigation() {
  // const user = await currentUser();
  // console.log("user: ", user);
  return (
    <div className="w-100% col-span-2 m-auto mx-2.5 flex items-center justify-between rounded-xl border-b-[0.5] border-neutral-300 bg-neutral-100 p-2 shadow-xs">
      <Logo />
      <input type="text" placeholder="Search Item..." className="input" />

      <ul className="sm:text-md flex items-center justify-between gap-2 font-semibold text-slate-700 sm:gap-4">
        <li>
          <ClerkSignInOut />
        </li>
      </ul>
    </div>
  );
}
