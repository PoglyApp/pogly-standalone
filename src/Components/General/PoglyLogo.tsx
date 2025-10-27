export const PoglyLogo: React.FC = () => {
  return (
    <div className="flex space-x-2 ml-5 mt-[6vh] mb-1 font-geist-mono justify-center items-end">
      <span className="font-semibold text-5xl max-sm:w-[290px]">
        Pogly <span className="text-[#82a5ff]">Standalone</span>
      </span>

      <span className="text-xs font-semibold py-0.2 px-1.5 rounded-md bg-[#82a5ff] text-[#10121a] mb-[3px]">
        v{process.env.REACT_APP_VERSION}
      </span>
    </div>
  );
};
