import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format amount in kobo to Naira string */
export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

/** Convert naira to kobo */
export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

/** Convert kobo to naira */
export function toNaira(kobo: number): number {
  return kobo / 100;
}

/** Format file size in bytes to human-readable string */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || bytes === 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Normalize Nigerian phone to E.164-like format (remove leading 0, add +234) */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) return digits;
  if (digits.startsWith("0") && digits.length === 11) return "234" + digits.slice(1);
  if (digits.length === 10) return "234" + digits;
  return digits;
}

/** Same as normalizePhone but returns null if invalid */
export function phoneToE164(phone: string): string | null {
  const normalized = normalizePhone(phone);
  if (normalized.length >= 10 && normalized.startsWith("234")) return `+${normalized}`;
  return null;
}
