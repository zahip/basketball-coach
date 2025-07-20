"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isAuthenticated?: boolean;
  className?: string;
}

export function Header({ isAuthenticated = false, className }: HeaderProps) {
  const t = useTranslations("HomePage");

  return (
    <header className={cn("w-full border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50", className)}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="rounded-full bg-orange-500 w-10 h-10 flex items-center justify-center shadow-md">
            <span className="text-2xl">🏀</span>
          </div>
          <span className="text-xl font-bold text-blue-900 hidden sm:block">
            {t("title")}
          </span>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">
                Dashboard
              </Link>
            </Button>
          ) : (
            <Button asChild variant="primary" size="sm">
              <Link href="/auth">
                {t("logIn")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}