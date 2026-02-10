interface VolumeData {
  keyword: string;
  volume: number;
  competition: number;
}

export function VolumeTable({ data }: { data: VolumeData[] }) {
  const sorted = [...data].sort((a, b) => b.volume - a.volume);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Search volume & competition
      </h3>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">Keyword</th>
              <th className="px-3 py-2 text-right font-medium">Volume</th>
              <th className="px-3 py-2 text-right font-medium">Competition</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.keyword} className="border-b last:border-0">
                <td className="px-3 py-2 font-mono text-xs">{row.keyword}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatVolume(row.volume)}
                </td>
                <td className="px-3 py-2 text-right">
                  <CompetitionDot value={row.competition} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatVolume(v: number): string {
  if (v >= 100000) return `${(v / 1000).toFixed(0)}K`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return String(v);
}

function CompetitionDot({ value }: { value: number }) {
  const level =
    value >= 70 ? "High" : value >= 40 ? "Med" : "Low";
  const color =
    value >= 70
      ? "text-red-600 dark:text-red-400"
      : value >= 40
        ? "text-amber-600 dark:text-amber-400"
        : "text-green-600 dark:text-green-400";

  return (
    <span className={`text-xs font-medium ${color}`}>
      {level}
      <span className="ml-1 text-[10px] text-muted-foreground">{value}</span>
    </span>
  );
}
