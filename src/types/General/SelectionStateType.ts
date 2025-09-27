import { SelectedType } from "./SelectedType"

export type SelectionStateType = {
    selected: SelectedType | undefined;
    setSelected: Function;
    selectoTargets: Array<SVGElement | HTMLElement>;
    setSelectoTargets: Function;
}