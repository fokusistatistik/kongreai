import { getServerSession } from "next-auth";
import { authOptions } from "./options";
import { UserRole } from "@/types";

/**
 * Get the current user session on the server
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Check if user has required role
 */
export async function hasRole(allowedRoles: UserRole[]) {
  const user = await getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes((user as any).role);
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  return hasRole(["admin"]);
}

/**
 * Check if user is Halk Sağlığı Müdürü
 */
export async function isHalkSagligiMudur() {
  return hasRole(["admin", "halk_sagligi_mudur"]);
}

/**
 * Check if user is Birim Müdürü
 */
export async function isBirimMudur() {
  return hasRole(["admin", "halk_sagligi_mudur", "birim_mudur"]);
}

/**
 * Require authentication or redirect
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
