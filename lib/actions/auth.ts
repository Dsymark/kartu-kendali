"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "kendali_session";

export async function loginAction(password: string, namaPetugas?: string) {
  const masterPassword = process.env.APP_PASSWORD || "kendali2026";

  if (!password || password.trim() !== masterPassword) {
    return {
      success: false,
      error: "Password akses salah! Pastikan huruf besar/kecil sesuai.",
    };
  }

  const sessionData = {
    authenticated: true,
    nama: namaPetugas?.trim() || "Petugas Armada",
    loginAt: new Date().toISOString(),
  };

  // Gunakan Base64 agar karakter aman dan standar di semua browser
  const encodedValue = Buffer.from(JSON.stringify(sessionData)).toString("base64");

  cookies().set({
    name: COOKIE_NAME,
    value: encodedValue,
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
    const decoded = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    try {
      return JSON.parse(sessionCookie.value);
    } catch {
      return null;
    }
  }
}
