"use client";

export default function CsvPreviewTable({
  data,
}: {
  data: Record<string, any>[];
}) {
  if (!data.length || !data[0]) return null; // ✅ FIX

  const headers = Object.keys(data[0]); // now safe

  return (
    <div className="overflow-auto border rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-200 dark:bg-gray-700">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {headers.map((key, j) => (
                <td key={j} className="px-3 py-2">
                  {String(row[key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}