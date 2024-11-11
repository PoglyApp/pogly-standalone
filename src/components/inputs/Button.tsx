interface IProps {
  icon?: any;
  text?: string;
  style?: any;
  className?: string;
}

export const Button = (props: IProps) => {
  return (
    <div className={props.className} style={{ color: "#7e828c", ...props.style }}>
      <button className="text-2xl" style={{ height: "100%" }}>
        {props.icon}
      </button>
    </div>
  );
};
