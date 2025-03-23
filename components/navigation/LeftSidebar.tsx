import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { auth, signOut } from "@/auth";
import ROUTES from "@/constants/routes";

import NavLinks from "./navbar/NavLinks";
import { useTranslation } from "@/app/i18n";
import { Button } from "../ui/button";

interface LeftSidebarProps {
  lng: string;
}

const LeftSidebar = async ({ lng }: LeftSidebarProps) => {
  const session = await auth();
  const userId = session?.user?.id;
  const { t } = await useTranslation(lng, "translation");

  return (
    <section className="background-light900_dark200 border-none sticky left-0 top-0 flex h-screen flex-col justify-between border-r p-6 pt-24 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-[300px]">
      <div className="flex flex-1 flex-col overflow-hidden">
        <NavLinks lng={lng} />
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {userId ? (
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
              <span className="text-dark300_light900 max-lg:hidden">
                {t("navigation.logout")}
              </span>
            </Button>
          </form>
        ) : (
          <>
            <Button
              className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none"
              asChild
            >
              <Link href={ROUTES.SIGN_IN(lng)}>
                <Image
                  src="/icons/account.svg"
                  alt={t("navigation.account")}
                  width={20}
                  height={20}
                  className="invert-colors lg:hidden"
                />
                <span className="primary-text-gradient max-lg:hidden">
                  {t("navigation.logIn")}
                </span>
              </Link>
            </Button>

            <Button
              className="small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none"
              asChild
            >
              <Link href={ROUTES.SIGN_UP(lng)}>
                <Image
                  src="/icons/sign-up.svg"
                  alt={t("navigation.account")}
                  width={20}
                  height={20}
                  className="invert-colors lg:hidden"
                />
                <span className="max-lg:hidden">{t("navigation.signUp")}</span>
              </Link>
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default LeftSidebar;
