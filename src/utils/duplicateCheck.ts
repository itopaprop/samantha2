/**
 * Utility functions for strict duplicate prevention across registrations (Staff, Resident, Relative, User, Application).
 * Complies with requirement: always check "email & phone" to avoid duplicate registration.
 */

export function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  // Extract all digit characters
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // Handle international prefixes like Nigerian +234
  if (digits.startsWith('234')) {
    return digits.slice(3);
  }
  // Handle local leading zero e.g. 080... -> 80...
  if (digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function arePhonesEqual(phone1?: string | null, phone2?: string | null): boolean {
  if (!phone1 || !phone2) return false;
  const p1 = normalizePhone(phone1);
  const p2 = normalizePhone(phone2);
  if (!p1 || !p2) return false;
  if (p1 === p2) return true;

  // Match if one contains the other or last 8+ digits match
  if (p1.length >= 7 && p2.length >= 7) {
    if (p1.endsWith(p2) || p2.endsWith(p1)) return true;
    if (p1.slice(-8) === p2.slice(-8)) return true;
  }
  return false;
}

export function areEmailsEqual(email1?: string | null, email2?: string | null): boolean {
  if (!email1 || !email2) return false;
  return email1.trim().toLowerCase() === email2.trim().toLowerCase();
}

/**
 * Checks if a candidate email or phone already exists in an entity collection
 */
export function findDuplicateRecord<T>(
  items: T[],
  candidateEmail?: string | null,
  candidatePhone?: string | null,
  getEmail?: (item: T) => string | null | undefined,
  getPhone?: (item: T) => string | null | undefined
): T | undefined {
  const cleanEmail = candidateEmail?.trim().toLowerCase();
  const cleanPhone = candidatePhone?.trim();

  return items.find(item => {
    const itemEmail = getEmail ? getEmail(item) : (item as any)?.email;
    const itemPhone = getPhone ? getPhone(item) : (item as any)?.phone || (item as any)?.emergencyContact?.phone || (item as any)?.emergency_contact_phone;

    if (cleanEmail && itemEmail && areEmailsEqual(itemEmail, cleanEmail)) {
      return true;
    }
    if (cleanPhone && itemPhone && arePhonesEqual(itemPhone, cleanPhone)) {
      return true;
    }
    return false;
  });
}
