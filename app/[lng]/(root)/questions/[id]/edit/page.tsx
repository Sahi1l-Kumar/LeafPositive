import { notFound, redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import { getQuestion } from "@/lib/actions/question.action";
import ROUTES from "@/constants/routes";

const EditQuestion = async ({ params }: RouteParams) => {
  const { id, lng } = await params;
  if (!id) return notFound();

  const session = await auth();
  if (!session) return redirect(ROUTES.SIGN_IN(lng));

  const { data: question, success } = await getQuestion({ questionId: id });
  if (!success) return notFound();

  if (question?.author.toString() !== session?.user?.id)
    redirect(ROUTES.QUESTION(lng, id));

  return (
    <main>
      <QuestionForm question={question} isEdit lng={lng} />
    </main>
  );
};

export default EditQuestion;
