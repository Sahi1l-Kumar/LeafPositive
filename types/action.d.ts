interface SignInWithOAuthParams {
  provider: "google";
  providerAccountId: string;
  user: {
    email: string;
    name: string;
    image: string;
    username: string;
  };
}

interface AuthCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface CreateQuestionParams {
  title: string;
  content: string;
  imageUrl?: string;
  crop?: string;
  image?: File;
}

interface EditQuestionParams extends CreateQuestionParams {
  questionId: string;
}

interface GetQuestionParams {
  questionId: string;
}

interface IncrementViewsParams {
  questionId: string;
}

interface CreateAnswerParams {
  questionId: string;
  content: string;
  imageUrl?: string;
  image?: File;
}

interface GetAnswersParams extends PaginatedSearchParams {
  questionId: string;
}

interface CreateVoteParams {
  targetId: string;
  targetType: "question" | "answer";
  voteType: "upvote" | "downvote";
}

interface UpdateVoteCountParams extends CreateVoteParams {
  change: 1 | -1;
}

type HasVotedParams = Pick<CreateVoteParams, "targetId" | "targetType">;

interface HasVotedResponse {
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

interface CreateChatParams {
  title?: string;
  message: {
    sender: "user" | "ai";
    content: string;
    imageUrl?: string;
    detectedDisease?: string;
    timestamp?: Date;
  };
}

interface GetChatParams {
  chatId: string;
}

type AddMessageParams = {
  chatId: string;
  message: {
    sender: "user" | "ai";
    content: string;
    imageUrl?: string;
    detectedDisease?: string;
  };
};
