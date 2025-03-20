"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function ButtonAuth() {
  const { data: session, status } = useSession();
  console.log({session, status});
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut()} className="btn btn-danger">
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => signIn()} className="btn btn-primary">
        Iniciar Sesión
      </button>
    </div>
  );
}
