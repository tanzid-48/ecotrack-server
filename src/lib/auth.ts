import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { bearer } from "better-auth/plugins";
import { getDB } from "../config/db";
import dotenv from "dotenv";

dotenv.config();

export function createAuth() {
  const db = getDB();

  return betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [process.env.CLIENT_URL as string],
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    account: {
      skipStateCookieCheck: true,
    },
    advanced: {
      crossSubDomainCookies: {
        enabled: false,
      },
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
      },
      ipAddress: {
        ipAddressHeaders: ["x-forwarded-for"],
      },
    },
    plugins: [bearer()],
  });
}

export let auth: ReturnType<typeof createAuth>;

export function initAuth() {
  auth = createAuth();
  return auth;
}
