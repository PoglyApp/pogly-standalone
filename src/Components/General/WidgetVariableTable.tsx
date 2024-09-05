import { ChangeEvent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import { VariableValueType } from "../../Types/General/WidgetVariableType";
import Checkbox from "@mui/material/Checkbox";
import { Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { HexColorPicker } from "react-colorful";
import { DebugLogger } from "../../Utility/DebugLogger";

interface Row {
  variableName: string;
  variableType: VariableValueType;
  variableValue: string | number | boolean;
}

interface IProps {
  variables: any[];
  setVariables: Function;
}

export const WidgetVariableTable = (props: IProps) => {
  const [rows, setRows] = useState<Row[]>(props.variables);

  const [showPickers, setShowPickers] = useState<{ [key: number]: boolean }>({});
  const colorInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  useEffect(() => {
    DebugLogger("Setting widget variables");
    props.setVariables(() => rows);
  }, [rows, props]);

  const handleVariableNameChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    DebugLogger("Handling widget variable name change");
    const { value } = event.target;
    const newRows = [...rows];

    newRows[index] = { ...newRows[index], variableName: value };
    setRows(newRows);
  };

  const handleVariableTypeChange = (index: number, event: ChangeEvent<HTMLSelectElement>) => {
    DebugLogger("Handling widget variable type change");
    const { value } = event.target;
    const newRows = [...rows];

    const variableType: VariableValueType = parseInt(value) as VariableValueType;

    newRows[index] = {
      ...newRows[index],
      variableType: variableType,
      variableValue:
        variableType === VariableValueType.boolean || variableType === VariableValueType.toggle ? false : "",
    };
    setRows(() => newRows);
  };

  const handleVariableValueChange = (
    index: number,
    event?: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    color?: string
  ) => {
    DebugLogger("Handling widget variable value change");
    const newRows = [...rows];

    if (color) {
      newRows[index] = { ...newRows[index], variableValue: color };
      colorInputRefs.current[index]!.value = color;
    } else if (event) {
      const { value, type } = event.target;

      if (event.target instanceof HTMLInputElement && type === "checkbox") {
        newRows[index] = { ...newRows[index], variableValue: event.target.checked };
      } else {
        newRows[index] = { ...newRows[index], variableValue: value };
      }
    }

    setRows(newRows);
  };

  const addRow = () => {
    DebugLogger("Adding new widget variable row");
    setRows([...rows, { variableName: "", variableType: VariableValueType.string, variableValue: "" }]);
  };

  const deleteRow = (index: number) => {
    DebugLogger("Deleting widget variable row");
    const newRows = rows.filter((_, rowIndex) => rowIndex !== index);
    setRows(() => newRows);
  };

  const moveRow = (index: number, direction: "up" | "down") => {
    DebugLogger("Moving widget variable row");
    const newRows = [...rows];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    const temp = newRows[targetIndex];
    newRows[targetIndex] = newRows[index];
    newRows[index] = temp;
    setRows(newRows);
  };

  const toggleColorPicker = (index: number) => {
    DebugLogger("Toggling color picker");
    setShowPickers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <TableWrapper>
      {rows.length > 0 ? (
        <StyledTable>
          <thead>
            <tr>
              <StyledTh>Name</StyledTh>
              <StyledTh style={{ display: "flex" }}>
                Type{" "}
                <Tooltip title="Toggle variables are shown in element context menu.">
                  <InfoIcon sx={{ fontSize: 14, color: "#ffffffa6", alignSelf: "center", paddingLeft: "3px" }} />
                </Tooltip>
              </StyledTh>
              <StyledTh>Value</StyledTh>
              <StyledTh>Actions</StyledTh>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <StyledTd>
                  <StyledInput
                    type="text"
                    name="variableName"
                    value={row.variableName}
                    onChange={(event) => handleVariableNameChange(index, event)}
                  />
                </StyledTd>
                <StyledTd>
                  <StyledSelect
                    name="variableType"
                    value={row.variableType}
                    onChange={(event) => handleVariableTypeChange(index, event)}
                  >
                    <option value={VariableValueType.string}>String</option>
                    <option value={VariableValueType.boolean}>Boolean</option>
                    <option value={VariableValueType.toggle}>Toggle</option>
                    <option value={VariableValueType.color}>Color</option>
                  </StyledSelect>
                </StyledTd>
                <StyledTd>
                  {row.variableType.toString() === VariableValueType.string.toString() && (
                    <StyledInput
                      type="text"
                      name="variableValue"
                      value={row.variableValue as string}
                      onChange={(event) => handleVariableValueChange(index, event)}
                    />
                  )}

                  {row.variableType.toString() === VariableValueType.boolean.toString() && (
                    <Checkbox
                      inputProps={{ "aria-label": "boolean-checkbox" }}
                      sx={{
                        "& .MuiSvgIcon-root": { fontSize: 28 },
                      }}
                      checked={(row.variableValue as boolean) || false}
                      onChange={(event) => handleVariableValueChange(index, event)}
                    />
                  )}

                  {row.variableType.toString() === VariableValueType.toggle.toString() && (
                    <Checkbox
                      inputProps={{ "aria-label": "boolean-checkbox" }}
                      sx={{
                        "& .MuiSvgIcon-root": { fontSize: 28 },
                      }}
                      checked={(row.variableValue as boolean) || false}
                      onChange={(event) => handleVariableValueChange(index, event)}
                    />
                  )}

                  {row.variableType === VariableValueType.color && (
                    <div style={{ display: "flex" }}>
                      <ColorBox
                        color={row.variableValue as string}
                        onClick={() => toggleColorPicker(index)}
                        style={{ backgroundColor: row.variableValue as string, marginRight: "10px" }}
                      />
                      <StyledInput
                        ref={(el) => (colorInputRefs.current[index] = el)}
                        type="text"
                        name="variableValue"
                        defaultValue={row.variableValue as string}
                        onChange={(event) => handleVariableValueChange(index, undefined, event.target.value)}
                        style={{ width: "125px", height: " 29px", alignSelf: "center" }}
                      />
                      {showPickers[index] && (
                        <Popover>
                          <Cover onClick={() => toggleColorPicker(index)} />
                          <HexColorPicker
                            color={row.variableValue as string}
                            onChange={(color) => handleVariableValueChange(index, undefined, color)}
                          />
                        </Popover>
                      )}
                    </div>
                  )}
                </StyledTd>
                <StyledTd>
                  <ActionsContainer>
                    <DeleteButton onClick={() => deleteRow(index)}>
                      <DeleteIcon />
                    </DeleteButton>
                    <ArrowContainer>
                      <ActionButton onClick={() => moveRow(index, "up")} disabled={index === 0}>
                        <ArrowUpwardIcon sx={{ color: "#ffffffa6" }} />
                      </ActionButton>
                      <ActionButton onClick={() => moveRow(index, "down")} disabled={index === rows.length - 1}>
                        <ArrowDownwardIcon sx={{ color: "#ffffffa6" }} />
                      </ActionButton>
                    </ArrowContainer>
                  </ActionsContainer>
                </StyledTd>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      ) : (
        <></>
      )}
      <StyledButton onClick={addRow}>New variable</StyledButton>
    </TableWrapper>
  );
};

const TableWrapper = styled.div`
  margin-top: 5px;
  color: #ffffffa6;
  margin-bottom: 15px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: #223b52;
  margin-bottom: 10px;
`;

const StyledTh = styled.th`
  border: 1px solid #192734;
  padding: 8px;
  background-color: #192734;
  text-align: left;
`;

const StyledTd = styled.td`
  border: 1px solid #192734;
  padding: 8px;

  & .MuiCheckbox-root {
    display: flex;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
  background-color: #192734;
  color: #b0bec5;
  border: 1px solid #3f80ea;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
  background-color: #192734;
  color: #b0bec5;
  border: 1px solid #3f80ea;
`;

const StyledButton = styled.button`
  margin: 5px;
  border: none;
  background-color: #3f80ea;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #4a90e2;
  }
`;

const ActionButton = styled.button`
  border: none;
  background-color: transparent;
  color: #b0bec5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;

  &:hover {
    color: #4a90e2;
  }

  &:disabled {
    color: #555;
    cursor: not-allowed;
  }

  & > * {
    font-size: 20px;
  }
`;

const DeleteButton = styled(StyledButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f44336;
  padding-top: 4px;
  padding-bottom: 4px;

  &:hover {
    background-color: #e41f1f;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ArrowContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 8px;
`;

const ColorBox = styled.div`
  width: 40px;
  height: 40px;
  border: 2px solid #fff;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
`;

const Popover = styled.div`
  position: absolute;
  z-index: 2;
`;

const Cover = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;
