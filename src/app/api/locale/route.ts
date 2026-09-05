import { NextResponse } from "next/server";

import { LOCALE_COOKIE, resolveLocale, safeReturnPath } from "../../../lib/i18n/config";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const locale = resolveLocale(requestUrl.searchParams.get("locale"));
  const returnTo = safeReturnPath(requestUrl.searchParams.get("returnTo"));
  // A relative Location preserves the browser's origin behind any reverse proxy.
  const response = new NextResponse(null, {
    status: 307,
    headers: { Location: returnTo, "Cache-Control": "no-store" },
  });

  response.cookies.set(LOCALE_COOKIE, locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
