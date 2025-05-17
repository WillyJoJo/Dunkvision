"use client";

import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getColumns } from "./columns";

export function DataTable({ equipos = [], orden, onSortChange }) {
  const columns = getColumns(orden, onSortChange);

  const table = useReactTable({
    data: equipos,
    columns,
    initialState: { pagination: { pageSize: 15 } },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <section
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        marginTop: "1rem",
      }}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => {
              const equipoId = row.original.id;
              return (
                <TableRow
                  key={row.id}
                  style={{ cursor: "pointer" }}
                  className="hover:bg-red-100 transition-colors"
                  onClick={() =>
                    (window.location.href = `/equipos/${equipoId}`)
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} style={{ textAlign: "center" }}>
                No hay ningún equipo que cumpla los filtros establecidos
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Controles de paginación */}
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Anterior
        </button>
        <span>
          Página{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </strong>
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}