"use client";

import React from "react";
import { useParams } from "next/navigation";

import AuthForm from "@/components/forms/AuthForm";
import { signUpWithCredentials } from "@/lib/actions/auth.action";
import { SignUpSchema } from "@/lib/validations";

const SignUp = () => {
  const params = useParams();
  const lng = (params.lng as string) || "en";

  return (
    <AuthForm
      formType="SIGN_UP"
      schema={SignUpSchema}
      defaultValues={{ email: "", password: "", name: "", username: "" }}
      onSubmit={signUpWithCredentials}
      lng={lng}
    />
  );
};

export default SignUp;
