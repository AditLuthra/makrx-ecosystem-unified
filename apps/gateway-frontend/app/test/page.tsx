export const dynamic = 'force-dynamic';

export default function TestPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            Test Page
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            This is a simple test page to verify builds work.
          </p>
        </div>
      </div>
    </div>
  );
}
