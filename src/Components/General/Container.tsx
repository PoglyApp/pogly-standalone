interface IProps {
  children: any;
  title?: string;
  subTitle?: string;
  className?: string;
  style?: any;
}

export const Container = ({ children, title, subTitle, className, style }: IProps) => {
  return (
    <div className={className} style={{ ...style }}>
      {title && (
        <div className="pl-5 text-[#edf1ff] mb-[-18px] text-[24px] w-full">
          {title}

          {subTitle && <span className="pl-2 text-[12px] text-[#82a5ff]">{subTitle}</span>}
        </div>
      )}
      <div className="rounded-xl bg-[#1e212b] w-full h-full">{children}</div>
    </div>
  );
};
