export function normalizeBrazilPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const national = digits.length >= 12 && digits.startsWith("55") ? digits.slice(2) : digits;
  return national.slice(0, 11);
}

export function formatBrazilPhone(value: string) {
  const digits = normalizeBrazilPhone(value);
  if (digits.length === 0) return "";
  if (digits.length < 3) return `(${digits}`;

  const areaCode = digits.slice(0, 2);
  const localNumber = digits.slice(2);
  if (localNumber.length <= 4) return `(${areaCode}) ${localNumber}`;

  const prefixLength = localNumber.length <= 8 ? 4 : 5;
  return `(${areaCode}) ${localNumber.slice(0, prefixLength)}-${localNumber.slice(prefixLength)}`;
}
