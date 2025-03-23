import acceptLanguage from "accept-language";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";

import { fallbackLng, languages, cookieName } from "./app/i18n/settings";

acceptLanguage.languages(languages);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico).*)"],
};

// Create an intermediate handler for the language logic
function handleLanguage(req: NextRequest) {
  let lng;
  if (req.cookies.has(cookieName))
    lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
  if (!lng) lng = acceptLanguage.get(req.headers.get("Accept-Language"));
  if (!lng) lng = fallbackLng;

  // Redirect if lng in path is not supported
  if (
    !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith("/_next")
  ) {
    return NextResponse.redirect(
      new URL(`/${lng}${req.nextUrl.pathname}`, req.url)
    );
  }

  if (req.headers.has("referer")) {
    const refererUrl = new URL(req.headers.get("referer") || "");
    const lngInReferer = languages.find((l) =>
      refererUrl.pathname.startsWith(`/${l}`)
    );
    const response = NextResponse.next();
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer);
    return response;
  }

  return NextResponse.next();
}

// The main middleware function that composes both middleware functions
export default auth((req) => {
  // Run the language middleware first
  const response = handleLanguage(req);
  // If it's a redirect or modified response, return it
  if (response.status !== 200) {
    return response;
  }
  // Otherwise, continue with the auth middleware
  return response;
});

// Ensure we still export the auth as middleware for Next.js
export { auth as middleware } from "@/auth";
