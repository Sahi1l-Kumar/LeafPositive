"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import ROUTES from "@/constants/routes";
import { useTranslation } from "@/app/i18n/client";

import { Button } from "../ui/button";
import { LoadingSpinner } from "../Loader";

interface SocialAuthFormProps {
  lng: string;
}

const SocialAuthForm = ({ lng }: SocialAuthFormProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { t, i18n } = useTranslation(lng, "translation");

  useEffect(() => {
    if (i18n.isInitialized) {
      setIsLoading(false);
    }
  }, [i18n.isInitialized]);

  if (isLoading) {
    return (
      <LoadingSpinner className="flex items-center justify-center h-full" />
    );
  }
  const buttonClass =
    "background-dark400_light900 body-medium text-dark200_light800 min-h-12 flex-1 rounded-2 px-4 py-3.5";

  const handleSignIn = async (provider: "google") => {
    try {
      await signIn(provider, {
        callbackUrl: ROUTES.HOME(lng),
        redirect: false,
      });
    } catch (error) {
      console.log(error);

      toast.error(t("auth.signInFailed"), {
        description:
          error instanceof Error ? error.message : t("auth.genericError"),
      });
    }
  };

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button className={buttonClass} onClick={() => handleSignIn("google")}>
        <Image
          src="/icons/google.svg"
          alt={t("auth.googleLogo")}
          width={20}
          height={20}
          className="mr-2.5 object-contain"
        />
        <span>{t("auth.loginWithGoogle")}</span>
      </Button>
    </div>
  );
};

export default SocialAuthForm;
