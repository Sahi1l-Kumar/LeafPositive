import Link from "next/link";

import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import { QuestionFilter } from "@/constants/filters";
import ROUTES from "@/constants/routes";
import { getEmptyQuestion } from "@/constants/states";
import { getQuestions } from "@/lib/actions/question.action";
import Pagination from "@/components/Pagination";
import { useTranslation } from "@/app/i18n";

interface SearchParams {
  searchParams: Promise<{ [key: string]: string }>;
  params: Promise<{ lng: string }>;
}

const Community = async ({ searchParams, params }: SearchParams) => {
  const { page, pageSize, query, filter } = await searchParams;
  const { lng } = await params;
  const { t } = await useTranslation(lng, "translation");
  const EMPTY_QUESTION = getEmptyQuestion(lng);

  const { success, data, error } = await getQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  const { questions, isNext } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">
          {t("navigation.community")}
        </h1>

        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION(lng)}>
            {t("question.askQuestion")}
          </Link>
        </Button>
      </section>
      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder={t("chat.searchPlaceholder")}
          otherClasses="flex-1"
        />

        <CommonFilter
          filters={QuestionFilter}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="max-md:flex"
        />
      </section>

      <DataRenderer
        success={success}
        error={error}
        data={questions}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className="mt-10 flex w-full flex-col gap-6">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} lng={lng} />
            ))}
          </div>
        )}
      />

      <Pagination page={page} isNext={isNext || false} lng={lng} />
    </>
  );
};

export default Community;
