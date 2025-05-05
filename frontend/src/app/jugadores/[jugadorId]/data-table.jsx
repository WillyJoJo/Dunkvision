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

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { columns as baseColumns } from "./columns";
import React from "react";

const columnasPorcentaje = [
  "porcentaje_tiros_de_campo",
  "porcentaje_efectivo_tiros_de_campo",
  "porcentaje_triples",
  "porcentaje_tiros_de_dos",
  "porcentaje_tiros_libres",
  "usage_porcentage"
];

const formatearCelda = (cell) => {
  const { column, getValue } = cell;
  const valor = getValue();

  if (columnasPorcentaje.includes(column.id)) {
    return valor !== null && valor !== undefined ? `${(valor * 100).toFixed(1)}%` : "-";
  }

  return valor;
};

export function DataTableJugador({ data }) {
  const columns = React.useMemo(() => {
    return baseColumns.map((col) => ({
      accessorKey: col.accessorKey,
      header: () => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={col.numeric ? "text-right block w-full" : ""}
                style={{ cursor: "help" }}
              >
                {col.header}
              </span>
            </TooltipTrigger>
            <TooltipContent>{col.tooltip}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      meta: { numeric: col.numeric }, // guardamos info adicional
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
    <section style={{ border: "1px solid #444", padding: "1rem", borderRadius: "10px", backgroundColor: "#0d0d0d" }}>
      <h2 className="text-xl font-bold mb-4 text-white">Estadísticas Avanzadas-Promedio</h2>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{ color: "#fff" }}
                  className={header.column.columnDef.meta?.numeric ? "text-right" : ""}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cell.column.columnDef.meta?.numeric ? "text-right" : ""}
                  >
                    {formatearCelda(cell)}
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