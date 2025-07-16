import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function LandingPage() {
  const t = await getTranslations("HomePage");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-hero opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-basketball-orange-50 via-basketball-blue-50 to-basketball-green-50"></div>
      
      {/* Floating Basketball Elements */}
      <div className="absolute top-20 left-10 w-12 h-12 bg-basketball-orange-500 rounded-full opacity-20 animate-bounce-gentle"></div>
      <div className="absolute top-40 right-20 w-8 h-8 bg-basketball-blue-500 rounded-full opacity-20 animate-pulse-subtle"></div>
      <div className="absolute bottom-40 left-20 w-6 h-6 bg-basketball-green-500 rounded-full opacity-20 animate-spin-slow"></div>
      <div className="absolute bottom-20 right-10 w-10 h-10 bg-basketball-orange-400 rounded-full opacity-20 animate-bounce-gentle"></div>
      
      {/* Navigation */}
      <nav className="relative z-10 glass border-b border-white/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-basketball-orange-500 rounded-full flex items-center justify-center shadow-basketball hover-scale">
                <span className="text-xl font-bold text-white">🏀</span>
              </div>
              <span className="text-xl font-bold gradient-text">Basketball Coach</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth" 
                className="text-basketball-blue-700 hover:text-basketball-blue-800 font-medium transition-colors nav-link"
              >
                Sign In
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20 md:py-32">
          {/* Hero Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full gradient-basketball shadow-basketball flex items-center justify-center hover-scale animate-fade-in">
                <span className="text-4xl md:text-5xl font-bold text-white">🏀</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-basketball-green-500 rounded-full animate-pulse-subtle"></div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-basketball-blue-500 rounded-full animate-bounce-gentle"></div>
            </div>
          </div>

          {/* Hero Title */}
          <h1 className="text-responsive-2xl font-bold text-gray-900 mb-6 animate-fade-in">
            <span className="gradient-text">{t("title")}</span>
          </h1>

          {/* Hero Description */}
          <p className="text-responsive-lg text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            {t("about")}
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in">
            <Link
              href="/auth"
              className="inline-flex items-center px-8 py-4 bg-basketball-orange-500 hover:bg-basketball-orange-600 text-white font-semibold rounded-2xl shadow-basketball hover:shadow-intense transition-all duration-300 hover:-translate-y-1 btn-ripple focus-ring"
            >
              <span className="mr-2">🚀</span>
              {t("signInRegister")}
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-responsive-xl font-bold text-gray-900 mb-4">
              <span className="gradient-text">Everything you need to coach</span>
            </h2>
            <p className="text-responsive-base text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for basketball coaches to manage teams, create training plans, and track progress.
            </p>
          </div>

          <div className="grid-responsive-sm">
            {/* Feature 1 */}
            <div className="glass rounded-2xl p-8 hover-lift card-hover group">
              <div className="w-16 h-16 gradient-basketball rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Organize your players, track positions, and manage team rosters with intuitive tools designed for basketball coaches.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass rounded-2xl p-8 hover-lift card-hover group">
              <div className="w-16 h-16 gradient-court rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Training Plans</h3>
              <p className="text-gray-600 leading-relaxed">
                Create comprehensive training programs with exercises, drills, and practice sessions tailored to your team's needs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass rounded-2xl p-8 hover-lift card-hover group">
              <div className="w-16 h-16 gradient-success rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Court Designer</h3>
              <p className="text-gray-600 leading-relaxed">
                Visualize plays and strategies with our interactive basketball court designer. Perfect for planning and instruction.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass rounded-2xl p-8 hover-lift card-hover group">
              <div className="w-16 h-16 gradient-basketball rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Progress Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor player development and team performance with detailed analytics and progress reports.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass rounded-2xl p-8 hover-lift card-hover group">
              <div className="w-16 h-16 gradient-court rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mobile Ready</h3>
              <p className="text-gray-600 leading-relaxed">
                Access your coaching tools anywhere with our responsive design that works perfectly on all devices.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass rounded-2xl p-8 hover-lift card-hover group">
              <div className="w-16 h-16 gradient-success rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Language</h3>
              <p className="text-gray-600 leading-relaxed">
                Support for multiple languages including English and Hebrew, making it accessible for coaches worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-20 md:py-32">
          <div className="glass rounded-3xl p-12 md:p-16 gradient-subtle">
            <h2 className="text-responsive-xl font-bold text-gray-900 mb-6">
              Ready to transform your coaching?
            </h2>
            <p className="text-responsive-base text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of coaches who are already using our platform to manage their teams and create better training experiences.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center px-8 py-4 gradient-basketball text-white font-semibold rounded-2xl shadow-basketball hover:shadow-intense transition-all duration-300 hover:-translate-y-1 btn-ripple focus-ring"
            >
              <span className="mr-2">🏀</span>
              Start Coaching Today
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 glass border-t border-white/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              <span suppressHydrationWarning>&copy; {new Date().getFullYear()}</span> {t("footer")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
