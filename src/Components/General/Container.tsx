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
        <div
          className="pl-5"
          style={{
            color: "#edf1ff",
            marginBottom: "-18px",
            fontSize: "24px",
            width: "100%",
          }}
        >
          {title}

          {subTitle && (
            <span className="pl-2" style={{ fontSize: "12px", color: "#82a5ff" }}>
              {subTitle}
            </span>
          )}
        </div>
      )}
      <div className="rounded-xl" style={{ backgroundColor: "#1e212b", width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
};
