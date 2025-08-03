export function utils_date_DateToDDMMYYYYHHMMString(date?: Date): string {
  if (!date) return "";
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return d.toLocaleDateString("vi-VN", options).replace(/\//g, "/");
}
