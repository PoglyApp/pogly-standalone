type TableProps = {
  headers: string[];
  rows: (string[] | Record<string, React.ReactNode>)[];
};

export const Table = ({ headers, rows }: TableProps) => {
  return (
    <table className="w-full text-xs md:text-sm border border-[#10121a]">
      <thead>
        <tr className="text-gray-400 uppercase tracking-wider text-[10px] md:text-xs">
          {headers.map((header) => (
            <th key={header} className="text-left py-3 px-3 md:px-4 font-medium whitespace-nowrap sticky bg-[#10121a]">
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, rowIndex) => {
          const cells = Array.isArray(row) ? row : headers.map((h) => row[h]);

          return (
            <tr key={rowIndex} className="border-t border-gray-800 hover:bg-[#17191f] transition">
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-3 px-3 md:px-4 text-gray-300 align-top whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
