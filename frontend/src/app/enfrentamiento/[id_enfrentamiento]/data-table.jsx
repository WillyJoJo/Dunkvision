"use client";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { columns as baseColumns } from "./columns";
import React from "react";
import { useRouter } from "next/navigation";

export function DataTable({ data }) {
  const router = useRouter();

  const columns = React.useMemo(() => {
    return baseColumns.map((col) => ({
      accessorKey: col.accessorKey,
      cell: col.cell ?? (({ row }) => {
        const val = row.original[col.accessorKey];
        return val !== undefined && val !== null ? val : "N/A";
      }),
      header: () => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span style={{ cursor: "help" }}>{col.header}</span>
            </TooltipTrigger>
            <TooltipContent>{col.tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    }));
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <section style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "10px", backgroundColor: "#fff" }}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => router.push(`/jugadores/${row.original.jugador_id}`)}
                style={{ cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} style={{ textAlign: "center" }}>
                No hay estadísticas disponibles.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Anterior
        </button>
        <span>
          Página <strong>{table.getState().pagination.pageIndex + 1}</strong> de {table.getPageCount()}
        </span>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Siguiente
        </button>
      </div>
    </section>
  );
}