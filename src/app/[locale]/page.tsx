import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { PricingSection } from "@/components/PricingSection";
import { AuthDebug } from "@/components/AuthDebug";

export default async function LandingPage() {
  const t = await getTranslations("HomePage");
  
  // Check if user is authenticated
  const supabase = await createClient();
  
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    
    // Only consider user authenticated if we have a valid user and no error
    if (!error && data?.user) {
      user = data.user;
    }
  } catch (error) {
    // If there's any error getting the user, consider them not authenticated
    console.log('Auth check error (expected during logout):', error);
    user = null;
  }
  
  // DEBUG: Temporarily disable redirect to see what's happening
  // TODO: Re-enable after debugging
  // if (user) {
  //   redirect("/dashboard");
  // }

  return (
    <div className="min-h-screen bg-white">
      <AuthDebug />
      <Header isAuthenticated={!!user} />
      
      <main>
        <HeroSection />
        <PricingSection />
      </main>
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="rounded-full bg-orange-500 w-10 h-10 flex items-center justify-center">
              <span className="text-2xl">🏀</span>
            </div>
            <span className="text-xl font-bold">{t("title")}</span>
          </div>
          
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            {t("about")}
          </p>
          
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-500 text-sm">
              <span suppressHydrationWarning>&copy; {new Date().getFullYear()}</span> {t("footer")}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
