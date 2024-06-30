import { ChangeEvent, useEffect, useState } from "react";
import styled from "styled-components";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import { VariableValueType } from "../../Types/General/WidgetVariableType";
import Checkbox from "@mui/material/Checkbox";
import { Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

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
  const [rows, setRows] = useState<Row[]>([] /*props.variables*/);

  useEffect(() => {
    // Due to variables being overhauled for version 0.1.0, this is here to wipe variables from older widgets that were made before this version
    // Can delete later, when the odds of someone still having old widgets are low
    // Remove empty array and uncomment props.variables when you delete this

    if (props.variables.length > 0 && props.variables[0].variableType !== undefined) {
      setRows(props.variables);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    props.setVariables(() => rows);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const handleVariableNameChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const newRows = [...rows];

    newRows[index] = { ...newRows[index], variableName: value };
    setRows(newRows);
  };

  const handleVariableTypeChange = (index: number, event: ChangeEvent<HTMLSelectElement>) => {
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

  const handleVariableValueChange = (index: number, event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value, type } = event.target;
    const newRows = [...rows];

    if (event.target instanceof HTMLInputElement && type === "checkbox") {
      newRows[index] = { ...newRows[index], variableValue: event.target.checked };
    } else {
      newRows[index] = { ...newRows[index], variableValue: value };
    }

    setRows(() => newRows);
  };
  const addRow = () => {
    setRows([...rows, { variableName: "", variableType: VariableValueType.string, variableValue: "" }]);
  };

  const deleteRow = (index: number) => {
    const newRows = rows.filter((_, rowIndex) => rowIndex !== index);
    setRows(() => newRows);
  };

  const moveRow = (index: number, direction: "up" | "down") => {
    const newRows = [...rows];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) return;
    const temp = newRows[targetIndex];
    newRows[targetIndex] = newRows[index];
    newRows[index] = temp;
    setRows(newRows);
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
