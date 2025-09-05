"use client";

// import logoImage from '@/public/InventoryProcess.png';
import { Lora } from "next/font/google";

import { useClerkRedirectUrl } from "@/app/_utils/helpers-client";
import { OrganizationSwitcher, SignedIn, UserButton } from "@clerk/nextjs";
import {
  ArchiveBoxIcon,
  ArrowsRightLeftIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { ChartPieIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "../../server/Footer";
import Logo from "../../server/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "./shadcn/shadcn-Sidebar";

const secondFont = Lora({
  // weight: '400',
  // weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  display: "swap",
});
export function AppSidebar() {
  const pathName = usePathname();
  const redirectUrl = useClerkRedirectUrl(true);

  const navLinks = {
    top: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: <HomeIcon className="" />,
      },

      {
        title: "Items",
        href: "/items",
        icon: <ArchiveBoxIcon className="" />,
      },

      {
        title: "Transactions",
        href: "/transactions",
        icon: <ArrowsRightLeftIcon className="" />,
      },

      {
        title: "Reports",
        href: "/reports",
        icon: <ChartPieIcon className="" />,
      },

      {
        title: "Setup",
        href: "/mysetup",
        // icon: <PuzzlePieceIcon className="" />,
        icon: <WrenchScrewdriverIcon className="" />,
      },
    ],
    bottom: [
      // {
      //   title: "Settings",
      //   href: "/settings",
      //   icon: <Cog8ToothIcon className="" />,
      // },
      // {
      //   title: "Sign out/ Account",
      //   href: "/",
      //   icon: <ArrowRightEndOnRectangleIcon />,
      // },
    ],
  };
  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader>
        <div className="mb-6 flex flex-col gap-6">
          <Logo />

          <OrganizationSwitcher
            afterCreateOrganizationUrl={redirectUrl}
            afterSelectOrganizationUrl={redirectUrl}
            appearance={{
              elements: {
                //TODO: customize the selector button
                // organizationPreviewMainIdentifier__organizationSwitcherTrigger:
                //   "text-3xl",
                // rootBox: " border border-accent-900 rounded-sm w-full",
                // rootBox: "text-3xl",
              },
            }}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.top.map((link) => (
                <SidebarMenuItem key={link.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={link.href}
                      className={`flex items-center justify-items-start gap-2 rounded-md p-2 transition-all duration-300 hover:font-semibold [&_svg]:size-6 hover:[&_svg]:stroke-[1.6] ${pathName === link.href ? "bg-neutral-100" : "hover:bg-neutral-100"}`}>
                      {link.icon}
                      <span>{link.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {navLinks.bottom.map((link) => (
            <SidebarMenuItem key={link.title}>
              <SidebarMenuButton asChild>
                <Link href={link.href}>
                  {link.icon}
                  <span>{link.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SignedIn>
              <div className="mb-4">
                <UserButton showName />
              </div>
            </SignedIn>
            <SidebarSeparator />
          </SidebarMenuItem>
        </SidebarMenu>
        <Footer />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
