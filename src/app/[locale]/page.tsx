import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function LandingPage() {
  const t = await getTranslations("HomePage");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-orange-100">
      <div className="flex gap-2 absolute top-4 right-4">
        <Link
          href="/"
          locale="en"
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        >
          English
        </Link>
        <Link
          href="/"
          locale="he"
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        >
          עברית
        </Link>
      </div>
      <header className="mb-10 flex flex-col items-center">
        <div className="rounded-full bg-orange-500 w-20 h-20 flex items-center justify-center mb-4 shadow-lg">
          <span className="text-4xl text-white font-bold">🏀</span>
        </div>
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-lg text-gray-700 max-w-md text-center">
          {t("about")}
        </p>
      </header>
      <Link
        href="/auth"
        className="px-8 py-3 rounded-full bg-blue-700 text-white text-lg font-semibold shadow-md hover:bg-blue-800 transition mb-8"
      >
        {t("signInRegister")}
      </Link>
      <footer className="mt-auto text-gray-400 text-xs py-4">
        &copy; {new Date().getFullYear()} Basketball Coach App
      </footer>
    </div>
  );
}
