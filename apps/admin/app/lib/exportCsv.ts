export function exportCSV<T extends Record<string, unknown>>(
  rows: T[],
  filename: string
) {
  if (!rows.length) return;

  const escapeValue = (value: unknown) => {
    const str = String(value ?? "");
    return `"${str.replace(/"/g, '""')}"`;
  };

  const firstRow = rows[0];

  if (!firstRow) return;

  const headers = Object.keys(firstRow);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeValue(row[header])).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
