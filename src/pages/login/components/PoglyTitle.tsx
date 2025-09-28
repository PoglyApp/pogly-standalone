export const PoglyTitle: React.FC = () => {
  return (
    <div className="flex space-x-2 ml-5 mt-5 mb-1 font-geist-mono justify-center items-end">
      <span className="font-regular text-5xl">
        pogly<span className="text-[#82a5ff] ml-4">standalone</span>
      </span>

      <span className="text-xs font-semibold py-0.2 px-1.5 rounded-md bg-[#82a5ff] text-[#10121a] mb-1">
        v{process.env.REACT_APP_VERSION}
      </span>
    </div>
  );
};
