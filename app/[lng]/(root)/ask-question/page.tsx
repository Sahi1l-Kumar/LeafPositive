import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import ROUTES from "@/constants/routes";

const AskQuestion = async ({
  params,
}: {
  params: Promise<{ lng: string }>;
}) => {
  const session = await auth();
  const { lng } = await params;

  if (!session) return redirect(ROUTES.SIGN_IN(lng));

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Ask a question</h1>

      <div className="mt-9">
        <QuestionForm lng={lng} />
      </div>
    </>
  );
};

export default AskQuestion;
