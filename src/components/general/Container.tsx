interface IProps {
  children: any;
  title?: string;
  subTitle?: string;
  className?: string;
  style?: any;
}

export const Container = (props: IProps) => {
  return (
    <div className={props.className} style={{ width: "fit-content", ...props.style }}>
      {props.title && (
        <div
          className="pl-5"
          style={{
            color: "#edf1ff",
            marginBottom: "-18px",
            fontSize: "24px",
            width: "100%",
          }}
        >
          {props.title}

          {props.subTitle && (
            <span className="pl-2" style={{ fontSize: "12px", color: "#82a5ff" }}>
              {props.subTitle}
            </span>
          )}
        </div>
      )}
      <div className="rounded-xl p-5" style={{ backgroundColor: "#1e212b", width: "100%", height: "100%" }}>
        {props.children}
      </div>
    </div>
  );
};
