import Image from "next/image";
import Link from "next/link";
import React from "react";

import { auth } from "@/auth";
import UserAvatar from "@/components/UserAvatar";

import MobileNavigation from "./MobileNavigation";
import Theme from "./Theme";
import LanguageSelector from "../../LanguageSelector";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";

const Navbar = async ({ lng }: { lng: string }) => {
  const session = await auth();
  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full gap-5 p-6 shadow-light-300 dark:shadow-none sm:px-12">
      <MobileNavigation lng={lng} />
      <div className="flex-between gap-5">
        <Link
          href={`/${lng}`}
          className="flex items-center gap-1 max-sm:hidden"
        >
          <Image
            src="/images/site-logo.svg"
            width={23}
            height={23}
            alt="LeafPositive Logo"
          />

          <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
            Leaf<span className="text-primary-500">Positive</span>
          </p>
        </Link>

        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900 max-sm:hidden"
          asChild
        >
          <Link href={ROUTES.COMMUNITY(lng)}>Community</Link>
        </Button>
      </div>

      <div className="flex-between gap-5">
        <LanguageSelector />
        <Theme lng={lng} />

        {session?.user?.id && (
          <UserAvatar
            id={session.user.id}
            name={session.user.name!}
            imageUrl={session.user?.image}
            lng={lng}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
