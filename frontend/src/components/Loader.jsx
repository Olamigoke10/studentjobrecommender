const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClass = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-5xl' }[size];
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <i className={`bx bx-loader-alt bx-spin text-primary-600 ${sizeClass}`} />
      {text && (
        <p className="mt-4 text-sm font-medium text-slate-500">{text}</p>
      )}
    </div>
  );
};

export default Loader;
