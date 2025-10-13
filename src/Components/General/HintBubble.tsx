import { CSSProperties, ReactNode } from "react";

interface IProps {
  children: ReactNode;
  hint: string;
  className?: string;
  style?: CSSProperties | undefined;
}
const HintBubble = ({ children, hint, className, style }: IProps) => {
  return (
    <div className="relative inline-block">
      {children}
      <div
        className={
          "absolute top-[-50px] left-1/2 transform -translate-x-1/2 bg-[#82a5ff] text-white p-2 rounded-lg z-50 whitespace-nowrap pt-0 animate-float " +
          className
        }
        style={style}
      >
        <span className="text-[12px]">{hint}</span>
        <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-[#82a5ff]"></div>
      </div>
    </div>
  );
};

export default HintBubble;
