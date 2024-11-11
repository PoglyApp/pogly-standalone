interface IProps {
  children: any;
  title: string;
  subTitle?: string;
  className?: string;
  style?: any;
}

export const Container = (props: IProps) => {
  return (
    <div className={props.className} style={{ width: "fit-content", ...props.style }}>
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
        <span className="pl-2" style={{ fontSize: "12px", color: "#82a5ff" }}>
          {props.subTitle}
        </span>
      </div>
      <div className="rounded-xl p-5" style={{ backgroundColor: "#1e212b", width: "fit-content" }}>
        {props.children}
      </div>
    </div>
  );
};
