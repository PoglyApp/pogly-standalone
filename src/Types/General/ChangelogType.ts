import { ChangeType } from "./ChangeType";

export type ChangelogType = {
    _readme: string;
    changes: ChangeType[];
}