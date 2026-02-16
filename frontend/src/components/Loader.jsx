const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`animate-spin rounded-full ${sizes[size]} border-b-2 border-blue-600`}></div>
      {text && <p className="mt-4 text-sm text-gray-500">{text}</p>}
    </div>
  );
};

export default Loader;