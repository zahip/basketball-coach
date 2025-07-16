export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout just handles the redirect to the default locale
  // The actual layout is in [locale]/layout.tsx
  return children;
}
