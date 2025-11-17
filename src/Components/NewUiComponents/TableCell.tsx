export const TableCell = ({ className, children }: any) => {
  return (
    <td className={`py-3 px-3 md:px-4 text-gray-300 align-top whitespace-nowrap${className ? className : ""}`}>
      {children}
    </td>
  );
};
