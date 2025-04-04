import { cookies } from "next/headers";

export default async function getLanguageFromCookie() {
  const cookieStore = await cookies();
  const lng = cookieStore.get("i18next");
  return lng?.value || "en";
}
