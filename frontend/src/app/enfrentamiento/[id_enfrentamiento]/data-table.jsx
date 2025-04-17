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
      ...col,
      header: () => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-semibold uppercase text-sm tracking-wide cursor-help text-white">
                {col.header}
              </span>
            </TooltipTrigger>
            <TooltipContent>{col.tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      cell: col.cell ?? (({ row }) => {
        const val = row.original[col.accessorKey];
        return val !== undefined && val !== null ? val : "N/A";
      }),
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
    <section className="mt-8 rounded-2xl border border-zinc-700 bg-[#0d0d0d] px-4 py-6">
      <h2 className="text-2xl font-bold text-white mb-4">Estadísticas de los Jugadores</h2>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-white border-zinc-700 text-sm">
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
                  className="hover:bg-zinc-800 transition cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-white text-sm border-zinc-700"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-white py-4">
                  No hay estadísticas disponibles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-between items-center text-white">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded disabled:opacity-40"
        >
          Anterior
        </button>
        <span>
          Página <strong>{table.getState().pagination.pageIndex + 1}</strong> de{" "}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}