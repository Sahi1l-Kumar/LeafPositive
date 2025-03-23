"use client";

import React from "react";
import { useParams } from "next/navigation";

import AuthForm from "@/components/forms/AuthForm";
import { signInWithCredentials } from "@/lib/actions/auth.action";
import { SignInSchema } from "@/lib/validations";

const SignIn = () => {
  const params = useParams();
  const lng = (params.lng as string) || "en";

  return (
    <AuthForm
      formType="SIGN_IN"
      schema={SignInSchema}
      defaultValues={{ email: "", password: "" }}
      onSubmit={signInWithCredentials}
      lng={lng}
    />
  );
};

export default SignIn;
