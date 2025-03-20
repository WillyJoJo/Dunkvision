import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@test.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_APP_API_URL}/api/login`,
            {
              email: credentials?.email,
              password: credentials?.password,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          const user = response.data;
          console.log({ user });

          if (user.error) {
            throw new Error(user.msg || "Credenciales inválidas");
          }

          // Se espera que "user" tenga: access_token, email y rol
          return user;
        } catch (error) {
          throw new Error(
            error.response?.data?.msg || "Error en la autenticación"
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Solo se ejecuta la primera vez (al hacer login)
      if (user) {
        token.accessToken = user.access_token; // Ajusta si tu backend devuelve otro nombre
        token.email = user.email;
        token.rol = user.rol;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        token: token.accessToken,
        email: token.email,
        rol: token.rol,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
