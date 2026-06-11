export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-gray-900 to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white text-xl font-bold">T</div>
          <h1 className="text-2xl font-bold text-white">TeamSync</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
