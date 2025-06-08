export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-xl mb-6">Page Not Found</h2>
      <p className="mb-6 text-center max-w-md">Sorry, the page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="text-blue-500 hover:underline">
        Return to Home
      </a>
    </div>
  );
} 