"use client";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LanguageSwitcher({ locale }: { locale: string }) {
  const t = useTranslations("LanguageSwitcher");
  const pathname = usePathname();
  return (
    <div className="fixed bottom-4 left-4 z-50 flex gap-2">
      <Link
        href={pathname}
        locale="en"
        className={`px-3 py-1 min-w-[60px] rounded-lg border shadow-sm transition text-sm font-medium flex items-center justify-center
          ${
            locale === "en"
              ? "bg-blue-700 text-white border-blue-700 shadow-md font-bold"
              : "bg-white text-blue-700 border-gray-300 hover:bg-blue-50"
          }
        `}
        style={{
          boxShadow:
            locale === "en" ? "0 2px 8px 0 rgba(30, 64, 175, 0.10)" : undefined,
        }}
      >
        {t("en")}
      </Link>
      <Link
        href={pathname}
        locale="he"
        className={`px-3 py-1 min-w-[60px] rounded-lg border shadow-sm transition text-sm font-medium flex items-center justify-center
          ${
            locale === "he"
              ? "bg-blue-700 text-white border-blue-700 shadow-md font-bold"
              : "bg-white text-blue-700 border-gray-300 hover:bg-blue-50"
          }
        `}
        style={{
          boxShadow:
            locale === "he" ? "0 2px 8px 0 rgba(30, 64, 175, 0.10)" : undefined,
        }}
      >
        {t("he")}
      </Link>
    </div>
  );
}
