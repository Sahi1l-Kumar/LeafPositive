import React, { ReactNode } from "react";
import { dir } from "i18next";

import LeftSidebar from "@/components/navigation/LeftSidebar";
import Navbar from "@/components/navigation/navbar";

import { languages } from "../../i18n/settings";

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

const RootLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lng: string }>;
}) => {
  const { lng } = await params;

  return (
    <main className="background-light850_dark100 relative">
      <Navbar lng={lng} />
      <div className="flex">
        <LeftSidebar lng={lng} />
        <section className="flex min-h-screen flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14">
          <div className="mx-auto w-full max-w-5xl" dir={dir(lng)}>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
};

export default RootLayout;
