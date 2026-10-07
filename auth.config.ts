import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const isAdminRoute =
        nextUrl.pathname.startsWith("/admin");

      const isAdminApiRoute =
        nextUrl.pathname.startsWith("/api/admin");

      if (isAdminRoute || isAdminApiRoute) {
        return isLoggedIn;
      }

      return true;
    },
  },

  providers: [],
} satisfies NextAuthConfig;
