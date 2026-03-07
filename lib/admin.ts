export const ADMIN_EMAILS = [
  "hadekunleadeniyi27@gmail.com", // <-- replace with your real admin email
  // "secondadmin@email.com",
];

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email.toLowerCase());
}