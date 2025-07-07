import { Link } from "@/i18n/navigation";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-orange-100">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-full bg-red-500 w-14 h-14 flex items-center justify-center mb-2 shadow">
            <span className="text-2xl text-white font-bold">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-900">
            Authentication Error
          </h2>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Sorry, there was an error signing you in. This could be due to:
          </p>
          <ul className="text-left text-sm text-gray-500 mb-4">
            <li>• Invalid authentication code</li>
            <li>• Expired session</li>
            <li>• Network connection issue</li>
          </ul>
        </div>

        <Link
          href="/auth"
          className="bg-blue-700 text-white py-2 px-6 rounded font-semibold hover:bg-blue-800 transition"
        >
          Try Again
        </Link>

        <Link href="/" className="mt-4 text-blue-700 hover:underline text-sm">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
