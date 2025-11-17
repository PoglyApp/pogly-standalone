import { PropsWithChildren } from "react";

type TableProps = {
  headers: string[];
  alignLastLeft?: boolean;
};

export const Table = ({ headers, alignLastLeft, children }: PropsWithChildren<TableProps>) => {
  return (
    <table className="w-full text-xs md:text-sm border border-[#10121a]">
      <thead>
        <tr className="text-gray-400 uppercase tracking-wider text-[10px] md:text-xs">
          {headers.map((header, index) => {
            const align = index === headers.length - 1 ? " text-right" : "";

            return (
              <th
                key={header}
                className={"text-left py-3 px-3 md:px-4 font-medium whitespace-nowrap sticky bg-[#10121a]" + align}
              >
                {header}
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody>{children}</tbody>
    </table>
  );
};
