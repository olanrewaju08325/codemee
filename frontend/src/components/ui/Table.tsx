import { forwardRef } from 'react';
import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div className="ui-table-container">
      <table ref={ref} className={`ui-table ${className}`} {...props}>
        {children}
      </table>
    </div>
  )
);
Table.displayName = 'Table';

export const Thead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', children, ...props }, ref) => (
    <thead ref={ref} className={className} {...props}>
      {children}
    </thead>
  )
);
Thead.displayName = 'Thead';

export const Tbody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = '', children, ...props }, ref) => (
    <tbody ref={ref} className={className} {...props}>
      {children}
    </tbody>
  )
);
Tbody.displayName = 'Tbody';

export const Tr = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className = '', children, ...props }, ref) => (
    <tr ref={ref} className={className} {...props}>
      {children}
    </tr>
  )
);
Tr.displayName = 'Tr';

export const Th = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', children, ...props }, ref) => (
    <th ref={ref} className={className} {...props}>
      {children}
    </th>
  )
);
Th.displayName = 'Th';

export const Td = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = '', children, ...props }, ref) => (
    <td ref={ref} className={className} {...props}>
      {children}
    </td>
  )
);
Td.displayName = 'Td';
