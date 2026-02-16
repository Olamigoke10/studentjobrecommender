const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-[3px]',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        className={`animate-spin rounded-full border-primary-200 border-t-primary-600 ${sizes[size]}`}
      />
      {text && (
        <p className="mt-4 text-sm font-medium text-slate-500">{text}</p>
      )}
    </div>
  );
};

export default Loader;
