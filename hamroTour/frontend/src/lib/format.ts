export function formatMoney(value: string | number | null | undefined) {
  const numeric = typeof value === "string" ? Number.parseFloat(value) : value;
  if (numeric == null || Number.isNaN(numeric)) {
    return "$0";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
