import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ROUTES from "@/constants/routes";
import { useTranslation } from "@/app/i18n";

import NavLinks from "./NavLinks";

interface MobileNavigationProps {
  lng: string;
}

const MobileNavigation = async ({ lng }: MobileNavigationProps) => {
  const session = await auth();
  const userId = session?.user?.id;
  const { t } = await useTranslation(lng, "translation");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Image
          src="/icons/hamburger.svg"
          width={36}
          height={36}
          alt={t("navigation.menu")}
          className="invert-colors sm:hidden"
        />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="background-light900_dark200 border-none"
      >
        <SheetTitle className="hidden">{t("navigation.title")}</SheetTitle>
        <Link href={`/${lng}`} className="flex items-center mt-3 gap-1">
          <Image
            src="/images/site-logo.svg"
            width={23}
            height={23}
            alt="Logo"
          />

          <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900">
            Plant<span className="text-primary-500">Pulse</span>
          </p>
        </Link>

        <div className="no-scrollbar flex h-full flex-col justify-between overflow-y-auto">
          <SheetClose asChild>
            <section className="flex flex-col gap-6 pt-16">
              <NavLinks isMobileNav lng={lng} />
            </section>
          </SheetClose>

          <div className="flex flex-col gap-3 py-6">
            {userId ? (
              <SheetClose asChild>
                <form
                  action={async () => {
                    "use server";

                    await signOut();
                  }}
                >
                  <Button
                    type="submit"
                    className="base-medium w-fit !bg-transparent px-4 py-3"
                  >
                    <LogOut className="size-5 text-black dark:text-white" />
                    <span className="text-dark300_light900">
                      {t("navigation.logout")}
                    </span>
                  </Button>
                </form>
              </SheetClose>
            ) : (
              <>
                <SheetClose asChild>
                  <Link href={ROUTES.SIGN_IN(lng)}>
                    <Button className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
                      <span className="primary-text-gradient">
                        {t("navigation.logIn")}
                      </span>
                    </Button>
                  </Link>
                </SheetClose>

                <SheetClose asChild>
                  <Link href={ROUTES.SIGN_UP(lng)}>
                    <Button className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none">
                      {t("navigation.signUp")}
                    </Button>
                  </Link>
                </SheetClose>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
