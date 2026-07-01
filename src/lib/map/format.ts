import { copies, type Locale } from "@/lib/i18n";

export function formatTime(
  value: string | undefined,
  locale: Locale,
  fallback: string,
) {
  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat(localeToDateLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

export function formatDateTime(
  value: string | undefined,
  copy: (typeof copies)[Locale],
) {
  if (!value) {
    return copy.detail.emptyUpdatedAt;
  }

  return new Intl.DateTimeFormat(localeToDateLocaleFromHtml(copy.htmlLang), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(new Date(value));
}

function localeToDateLocale(locale: Locale) {
  const locales: Record<Locale, string> = {
    zh: "zh-CN",
    ja: "ja-JP",
    en: "en-US",
  };

  return locales[locale];
}

function localeToDateLocaleFromHtml(htmlLang: string) {
  if (htmlLang === "ja") {
    return "ja-JP";
  }

  if (htmlLang === "zh-CN") {
    return "zh-CN";
  }

  return "en-US";
}
