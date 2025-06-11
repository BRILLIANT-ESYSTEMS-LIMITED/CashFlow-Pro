import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-primary-500 animate-spin" />
        <span className="mt-4 text-lg font-medium text-gray-700">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingScreen;