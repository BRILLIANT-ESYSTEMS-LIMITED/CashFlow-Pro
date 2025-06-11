import { Link } from 'react-router-dom';
import { FileSpreadsheet, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50">
      <FileSpreadsheet className="h-16 w-16 text-primary-500 mb-4" />
      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-gray-600 text-center max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Home className="mr-2 h-5 w-5" />
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;