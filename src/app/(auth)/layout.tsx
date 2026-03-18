export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
