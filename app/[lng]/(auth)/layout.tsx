import Image from "next/image";
import { ReactNode } from "react";
import { useTranslation } from "@/app/i18n";
import SocialAuthForm from "@/components/forms/SocialAuthForm";

interface AuthLayoutProps {
  children: ReactNode;
  lng: string;
}

const AuthLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: { lng: string };
}) => {
  const { lng } = params;
  const { t } = await useTranslation(lng, "translation");

  return (
    <main className="flex min-h-screen items-center justify-center bg-auth-light bg-cover bg-center bg-no-repeat px-4 py-10 dark:bg-auth-dark">
      <section className="light-border background-light800_dark200 shadow-light100_dark100 min-w-full rounded-[10px] border px-4 py-10 shadow-md sm:min-w-[520px] sm:px-8">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2.5">
            <h1 className="h2-bold text-dark100_light900">
              {t("auth.joinLeafPositive")}
            </h1>
            <p className="paragraph-regular text-dark500_light400">
              {t("auth.getQuestionsAnswered")}
            </p>
          </div>
          <Image
            src="/images/site-logo.svg"
            alt={t("auth.leafPositiveLogo")}
            width={50}
            height={50}
            className="object-contain"
          />
        </div>

        {children}

        <SocialAuthForm lng={lng} />
      </section>
    </main>
  );
};

export default AuthLayout;
