import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { NextRequest } from "next/server";
import { getDb } from "./db";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "./schema";

function createAuth() {
  return NextAuth({
    adapter: DrizzleAdapter(getDb(), {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
    providers: [
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
    ],
    pages: {
      signIn: "/auth/signin",
    },
    callbacks: {
      session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
  });
}

type AuthInstance = ReturnType<typeof createAuth>;
let _authInstance: AuthInstance | null = null;

function getAuthInstance(): AuthInstance {
  if (!_authInstance) {
    _authInstance = createAuth();
  }
  return _authInstance;
}

export const handlers = {
  GET: (req: NextRequest) => getAuthInstance().handlers.GET(req),
  POST: (req: NextRequest) => getAuthInstance().handlers.POST(req),
};

export function signIn(
  ...args: Parameters<AuthInstance["signIn"]>
) {
  return getAuthInstance().signIn(...args);
}

export function signOut(
  ...args: Parameters<AuthInstance["signOut"]>
) {
  return getAuthInstance().signOut(...args);
}

export const auth: AuthInstance["auth"] = ((...args: any[]) => {
  return (getAuthInstance().auth as any)(...args);
}) as AuthInstance["auth"];
