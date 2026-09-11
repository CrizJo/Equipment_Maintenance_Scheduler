import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_COLORS = {
  operational: "#34c759",
  under_maintenance: "#ff9f0a",
  out_of_service: "#ff3b30",
  retired: "#8e8e93",
};

export default function StatusDonut({ data }) {
  const rows = (data || []).map((item) => ({
    ...item,
    color: STATUS_COLORS[item.key] || "#8e8e93",
  }));
  const total = rows.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">Equipment by status</h2>
      <p className="mt-1 text-sm text-[#6e6e73]">Live mix of the current fleet</p>

      {total === 0 ? (
        <p className="mt-16 text-center text-sm text-[#86868b]">No equipment to chart yet.</p>
      ) : (
        <div className="mt-2 grid items-center gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={104}
                  paddingAngle={3}
                  stroke="none"
                >
                  {rows.map((item) => (
                    <Cell key={item.key} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">{total}</p>
              <p className="text-xs font-medium text-[#86868b]">Machines</p>
            </div>
          </div>

          <ul className="space-y-3 pr-2">
            {rows.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-8 text-sm">
                <span className="flex items-center gap-2 text-[#1d1d1f]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="tabular-nums text-[#6e6e73]">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-2xl bg-white px-3 py-2 text-sm shadow-lg ring-1 ring-black/5">
      <p className="font-medium text-[#1d1d1f]">{item.name}</p>
      <p className="text-[#6e6e73]">{item.value} machine{item.value === 1 ? "" : "s"}</p>
    </div>
  );
}
