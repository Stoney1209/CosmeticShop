import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "cosmetics_customer_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type CustomerSession = {
  id: number;
  email: string;
  fullName: string;
};

function getSecret() {
  return (
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-customer-session-secret"
  );
}

function encode(payload: CustomerSession) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}

function decode(value: string): CustomerSession | null {
  const [body, signature] = value.split(".");

  if (!body || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(body)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as CustomerSession;
  } catch {
    return null;
  }
}

export async function getCustomerSession() {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  return decode(value);
}

export async function setCustomerSession(session: CustomerSession) {
  const store = await cookies();
  store.set(COOKIE_NAME, encode(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearCustomerSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

