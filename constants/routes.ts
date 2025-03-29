const ROUTES = {
  HOME: (lng: string) => `/${lng}`,
  SIGN_IN: (lng: string) => `/${lng}/sign-in`,
  SIGN_UP: (lng: string) => `/${lng}/sign-up`,
  ASK_QUESTION: (lng: string) => `/${lng}/ask-question`,
  COMMUNITY: (lng: string) => `/${lng}/community`,
  PROFILE: (lng: string, id: string) => `/${lng}/profile/${id}`,
  QUESTION: (lng: string, id: string) => `/${lng}/questions/${id}`,
  SIGN_IN_WITH_OAUTH: `signin-with-oauth`,
  CHAT: (lng: string, id: string) => `/${lng}/questions/${id}`,
};

export default ROUTES;
