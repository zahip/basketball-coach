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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-100">
      <TrainingSetBuilder locale={locale} />
    </div>
  );
}