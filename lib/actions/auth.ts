"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "kendali_session";
export type UserRole = "admin" | "viewer";

function getSessionSecret() {
  return process.env.APP_SESSION_SECRET || process.env.APP_PASSWORD || "local-session-secret";
}

function encodeSession(sessionData: object) {
  const payload = Buffer.from(JSON.stringify(sessionData)).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function decodeSession(value: string) {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
}

export async function loginAction(
  password: string,
  namaPetugas?: string,
  role: UserRole = "admin"
) {
  const adminPassword = process.env.APP_ADMIN_PASSWORD || process.env.APP_PASSWORD || "kendali2026";
  const viewerPassword = process.env.APP_VIEWER_PASSWORD || "viewer-kendali-2026";
  const validPassword = role === "admin" ? adminPassword : viewerPassword;

  if (!password || password.trim() !== validPassword) {
    return {
      success: false,
      error: "Password akses salah! Pastikan huruf besar/kecil sesuai.",
    };
  }

  const sessionData = {
    authenticated: true,
    role,
    nama: namaPetugas?.trim() || "Petugas Armada",
    loginAt: new Date().toISOString(),
  };

  cookies().set({
    name: COOKIE_NAME,
    value: encodeSession(sessionData),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // Aktif selama 7 hari
  });

  return { success: true };
}

export async function logoutAction() {
  cookies().delete(COOKIE_NAME);
  redirect("/login");
}

export async function getSesiPetugas() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    return decodeSession(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getSesiPetugas();
  if (!session || session.role !== "admin") {
    throw new Error("Akses ditolak: hanya Admin yang dapat mengubah data.");
  }
  return session;
}
