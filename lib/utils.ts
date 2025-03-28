import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTimeStamp = (createdAt: Date) => {
  const date = new Date(createdAt);
  const now = new Date();

  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const unit of units) {
    const interval = Math.floor(secondsAgo / unit.seconds);
    if (interval >= 1) {
      return `${interval} ${unit.label}${interval > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};

export const formatNumber = (number: number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  } else {
    return number.toString();
  }
};

export function getLanguageFromCookie(): string {
  // Check if we're in a server-side context
  if (typeof window === "undefined") {
    try {
      const { cookies } = require("next/headers");
      const cookieStore = cookies();
      return cookieStore.get("i18next")?.value || "en";
    } catch (error) {
      return "en";
    }
  }

  // Client-side retrieval
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("i18next="))
      ?.split("=")[1] || "en"
  );
}
