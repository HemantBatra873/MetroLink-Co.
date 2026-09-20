import * as React from "react"
import { cn } from "cn"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "./empty.js"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table.js"

type DataTableColumn<T extends Record<string, unknown>> = {
  key: string
  header: React.ReactNode
  cell?: (row: T) => React.ReactNode
  className?: string
}

type DataTableProps<T extends Record<string, unknown>> = {
  columns: DataTableColumn<T>[]
  data: T[]
  emptyState?: React.ReactNode
  emptyTitle?: React.ReactNode
  emptyDescription?: React.ReactNode
  className?: string
  tableClassName?: string
  getRowKey?: (row: T, index: number) => string
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyState,
  emptyTitle = "No results",
  emptyDescription = "There is nothing to display yet.",
  className,
  tableClassName,
  getRowKey,
}: DataTableProps<T>) {
  if (data.length === 0) {
    if (emptyState) {
      return <>{emptyState}</>
    }

    return (
      <Empty data-slot="data-table-empty" className={className}>
        <EmptyHeader>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div data-slot="data-table" className={cn(className)}>
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={getRowKey?.(row, rowIndex) ?? String(rowIndex)}
            >
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.cell
                    ? column.cell(row)
                    : String(row[column.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { DataTable }
export type { DataTableColumn, DataTableProps }
