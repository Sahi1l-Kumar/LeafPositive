import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";

import ROUTES from "@/constants/routes";
import { hasVoted } from "@/lib/actions/vote.action";
import { getTimeStamp } from "@/lib/utils";

import UserAvatar from "../UserAvatar";
import Votes from "../votes/Votes";
import getLanguageFromCookie from "@/lib/cookies";
import Preview from "../Preview";
import { useTranslation } from "@/app/i18n";

const AnswerCard = async ({
  _id,
  author,
  content,
  createdAt,
  upvotes,
  downvotes,
  imageUrl,
}: Answer) => {
  const lng = await getLanguageFromCookie();
  const { t } = await useTranslation(lng, "translation");
  const hasVotedPromise = hasVoted({
    targetId: _id,
    targetType: "answer",
  });

  return (
    <article className="light-border border-b py-10">
      <span id={JSON.stringify(_id)} className="hash-span" />

      <div className="mb-5 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 items-start gap-1 sm:items-center">
          <UserAvatar
            id={author._id}
            name={author.name}
            imageUrl={author.image}
            className="size-5 rounded-full object-cover max-sm:mt-2"
            lng={lng}
          />

          <Link
            href={ROUTES.PROFILE(lng, author._id)}
            className="flex flex-col max-sm:ml-1 sm:flex-row sm:items-center"
          >
            <p className="body-semibold text-dark300_light700">
              {author.name ?? t("common.anonymous")}
            </p>

            <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
              <span className="max-sm:hidden"> • </span>
              {t("answer.answered")} {getTimeStamp(createdAt)}
            </p>
          </Link>
        </div>

        <div className="flex justify-end">
          <Suspense fallback={<div>Loading...</div>}>
            <Votes
              targetType="answer"
              targetId={_id}
              hasVotedPromise={hasVotedPromise}
              upvotes={upvotes}
              downvotes={downvotes}
            />
          </Suspense>
        </div>
      </div>

      {imageUrl && (
        <div className="sm:w-1/3 max-w-[200px]">
          <div className="relative w-full pt-[100%] rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt="Answer Image"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      <Preview content={content} />
    </article>
  );
};

export default AnswerCard;
