import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrainingSetBuilder } from "@/components/TrainingSetBuilder";

export default async function TrainingSetBuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth`);
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-subtle"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-basketball-orange-50/30 via-basketball-blue-50/30 to-basketball-green-50/30"></div>
      
      {/* Floating Basketball Elements */}
      <div className="absolute top-20 left-10 w-8 h-8 bg-basketball-orange-500 rounded-full opacity-10 animate-bounce-gentle"></div>
      <div className="absolute top-60 right-20 w-6 h-6 bg-basketball-blue-500 rounded-full opacity-10 animate-pulse-subtle"></div>
      <div className="absolute bottom-40 left-20 w-4 h-4 bg-basketball-green-500 rounded-full opacity-10 animate-spin-slow"></div>
      <div className="absolute bottom-80 right-10 w-10 h-10 bg-basketball-orange-400 rounded-full opacity-10 animate-bounce-gentle"></div>
      
      {/* Training Set Builder */}
      <TrainingSetBuilder locale={locale} />
    </div>
  );
}