export default function Dashboard() {
  // SSR/SSG or mock mode: return static fallback UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Dashboard (Static Export)</h1>
      <p className="text-lg text-gray-600 mb-8">
        This is a static fallback dashboard. Auth and dynamic data are disabled in static export.
      </p>
    </div>
  );
}
