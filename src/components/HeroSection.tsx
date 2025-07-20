"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  const t = useTranslations("HomePage");

  return (
    <section className={cn(
      "relative py-20 px-4 bg-gradient-to-br from-blue-50 to-orange-100 overflow-hidden",
      className
    )}>
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-orange-300 rounded-full opacity-40 animate-pulse delay-500"></div>
      </div>
      
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        {/* Basketball Icon */}
        <div className="rounded-full bg-orange-500 w-20 h-20 flex items-center justify-center mb-8 shadow-lg mx-auto animate-bounce">
          <span className="text-4xl text-white font-bold">🏀</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-900 mb-6 tracking-tight leading-tight">
          {t("heroTitle")}
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("heroDescription")}
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="xl" variant="primary" className="shadow-lg hover:shadow-xl transition-all duration-300">
            <Link href="/auth">
              {t("getStarted")}
            </Link>
          </Button>
          
          <Button asChild size="xl" variant="primaryOutline" className="hover:shadow-lg transition-all duration-300">
            <Link href="#pricing">
              View Pricing
            </Link>
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Trusted by coaches worldwide</p>
          <div className="flex items-center justify-center gap-8 text-2xl opacity-60">
            <span>🏆</span>
            <span>👨‍🏫</span>
            <span>📱</span>
            <span>📊</span>
            <span>⭐</span>
          </div>
        </div>
      </div>
    </section>
  );
}