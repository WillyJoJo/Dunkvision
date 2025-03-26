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
          // Validate input
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Invalid credentials");
          }

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_APP_API_URL}/api/login`, // Use server-side environment variable
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          const user = response.data;

          // Check for errors in the response
          if (user.error) {
            throw new Error("Invalid credentials");
          }

          // Return user object (ensure it contains only necessary fields)
          return {
            access_token: user.access_token,
            email: user.email,
            rol: user.rol,
          };
        } catch (error) {
          console.error("Authentication error:", error.message); // Avoid logging sensitive data
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
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
