"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { restablecer_contrasena } from "@/services/usuariosService";
import { PasswordInput } from "@/components/ui/password-input";
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

export default function RestablecerContrasenaCliente() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [formReady, setFormReady] = useState(false); // indica si la validación pasó
  const router = useRouter();

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setFormReady(true);
    setOpenDialog(true); // abre el diálogo si todo está bien
  };

  const handleConfirmSubmit = async () => {
    try {
      const res = await restablecer_contrasena(token, password);
      setOpenDialog(false);
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al cambiar la contraseña");
      setOpenDialog(false);
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "400px", margin: "0 auto" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #000 0%, #f00 100%)",
          color: "#fff",
          textAlign: "center",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Restablecer contraseña</h2>
        <p style={{ marginTop: "0.5rem" }}>Introduce tu nueva contraseña</p>
      </div>

      <form onSubmit={handlePreSubmit}>
        <label htmlFor="password" style={{ fontWeight: "bold" }}>
          Nueva contraseña
        </label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
        />

        <label
          htmlFor="confirm"
          style={{ fontWeight: "bold", marginTop: "1rem" }}
        >
          Confirmar contraseña
        </label>
        <PasswordInput
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repite la contraseña"
        />

        <button type="submit" className="btn btn-success w-100 mt-3">
          Cambiar contraseña
        </button>
      </form>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de cambiar tu contraseña. Asegúrate de apuntarla o guardarla en un lugar seguro, ya que no podrás recuperarla después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Confirmar cambio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}