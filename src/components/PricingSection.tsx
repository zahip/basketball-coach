"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PricingPlan {
  id: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: string;
  highlight?: boolean;
}

interface PricingSectionProps {
  className?: string;
}

export function PricingSection({ className }: PricingSectionProps) {
  const t = useTranslations("HomePage.pricing");

  const plans: PricingPlan[] = [
    {
      id: "freemium",
      title: t("freemium.title"),
      price: t("freemium.price"),
      period: t("freemium.period"),
      description: t("freemium.description"),
      features: t.raw("freemium.features") as string[],
      cta: t("freemium.cta"),
    },
    {
      id: "coachPro",
      title: t("coachPro.title"),
      price: t("coachPro.price"),
      period: t("coachPro.period"),
      description: t("coachPro.description"),
      features: t.raw("coachPro.features") as string[],
      cta: t("coachPro.cta"),
      popular: t("coachPro.popular"),
      highlight: true,
    },
    {
      id: "clubPlan",
      title: t("clubPlan.title"),
      price: t("clubPlan.price"),
      period: t("clubPlan.period"),
      description: t("clubPlan.description"),
      features: t.raw("clubPlan.features") as string[],
      cta: t("clubPlan.cta"),
    },
  ];

  return (
    <section id="pricing" className={cn("py-20 px-4 bg-gray-50", className)}>
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant={plan.highlight ? "elevated" : "default"}
              className={cn(
                "relative flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                plan.highlight && "ring-2 ring-blue-500 scale-105 shadow-xl"
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    {plan.popular}
                  </span>
                </div>
              )}

              <CardHeader className={cn("text-center pb-4", plan.highlight && "pt-8")}>
                <CardTitle className="text-2xl font-bold text-blue-900">
                  {plan.title}
                </CardTitle>
                <div className="py-4">
                  <span className="text-4xl font-bold text-blue-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-500 text-base ml-2">
                      / {plan.period}
                    </span>
                  )}
                </div>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-6">
                <Button
                  asChild
                  variant={plan.highlight ? "primary" : "primaryOutline"}
                  size="lg"
                  className="w-full"
                >
                  <Link href="/auth">
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-4">
            All plans include 30-day free trial • Cancel anytime • No setup fees
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <span>🔒</span>
              Secure payments
            </span>
            <span className="flex items-center gap-2">
              <span>📱</span>
              Mobile optimized
            </span>
            <span className="flex items-center gap-2">
              <span>💬</span>
              24/7 support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}