export const Logo: React.FC = () => {
  return (
    <div className="flex items-center ml-5 mt-5">
      <span className="flex items-center 2xl:text-4xl xl:text-4xl lg:text-4xl md:text-xl sm:text-lg" style={{ color: "#edf1ff" }}>
        <img src="./assets/stone.svg" className="2xl:w-[42px] xl:w-[42px] lg:w-[42px] md:w-[36px] sm:w-[28px]" />pogly_<span style={{ color: "#82a5ff"}}>standalone</span>
      </span>
    </div>
  );
};
