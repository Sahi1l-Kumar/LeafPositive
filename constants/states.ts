import ROUTES from "./routes";

export const DEFAULT_EMPTY = {
  title: "No Data Found",
  message:
    "Looks like the database is taking a nap. Wake it up with some new entries.",
  button: {
    text: "Add Data",
    href: ROUTES.HOME,
  },
};

export const DEFAULT_ERROR = {
  title: "Something Went Wrong",
  message: "Even our code can have a bad day. Give it another shot.",
  button: {
    text: "Retry Request",
    href: ROUTES.HOME,
  },
};

export const EMPTY_QUESTION = {
  title: "Ahh, No Questions Yet!",
  message:
    "The question board is empty. Maybe it’s waiting for your brilliant question to get things rolling",
  button: {
    text: "Ask a Question",
    href: ROUTES.ASK_QUESTION,
  },
};

export const EMPTY_ANSWERS = {
  title: "No Answers Found",
  message:
    "The answer board is empty. Make it rain with your brilliant answer.",
};
