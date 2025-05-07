"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // 🆕 Importar router
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

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { columns as baseColumns } from "./columns";

export function DataTable({ lesiones = [], isAdmin = false, onDelete }) {
  const router = useRouter(); // 🆕 Instanciar router

  const columns = React.useMemo(() => {
    if (isAdmin) {
      return [
        ...baseColumns,
        {
          id: "actions",
          header: "Acciones",
          cell: ({ row }) => (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link href={`/lesiones/editar/${row.original.id}`}>
                <button
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#000088")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#00f")}
                  style={{
                    padding: "0.3rem 0.6rem",
                    backgroundColor: "#00f",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  Editar
                </button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    style={{
                      padding: "0.3rem 0.6rem",
                      backgroundColor: "#f00",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Eliminar
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará permanentemente la lesión de <strong>{row.original.jugador}</strong>. No se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(row.original.id)}>
                      Confirmar eliminación
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ),
        },
      ];
    }
    return baseColumns;
  }, [isAdmin, onDelete]);

  const table = useReactTable({
    data: lesiones,
    columns,
    initialState: { pagination: { pageSize: 20 } },
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
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-red-100 transition"
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} style={{ textAlign: "center" }}>
                No hay lesiones registradas.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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