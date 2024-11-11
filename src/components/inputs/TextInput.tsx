interface IProps {
  defaultValue: string;
  label?: any;
  style?: any;
}

export const TextInput = (props: IProps) => {
  return (
    <div>
      {props.label && (
        <label className="pr-2" style={{ color: "#edf1ff" }}>
          {props.label}
        </label>
      )}

      <input
        className="rounded-sm"
        style={{
          backgroundColor: "#10121a",
          color: "#edf1ff",
          paddingLeft: "8px",
          paddingTop: "3px",
          paddingBottom: "3px",
          ...props.style,
        }}
        defaultValue={props.defaultValue}
      />
    </div>
  );
};
