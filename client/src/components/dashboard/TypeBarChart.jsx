import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const TYPE_COLORS = {
  preventive: "#3b5bdb",
  corrective: "#ff9f0a",
  inspection: "#7c5cfc",
};

export default function TypeBarChart({ data }) {
  const rows = (data || []).map((item) => ({
    ...item,
    fill: TYPE_COLORS[item.key] || "#3b5bdb",
  }));
  const total = rows.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">Tasks by type</h2>
      <p className="mt-1 text-sm text-[#6e6e73]">Preventive, corrective, and inspection work</p>

      {total === 0 ? (
        <p className="mt-16 text-center text-sm text-[#86868b]">No maintenance tasks to chart yet.</p>
      ) : (
        <div className="mt-6 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} barSize={42} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f0f0f2" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6e6e73", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#86868b", fontSize: 12 }}
              />
              <Tooltip cursor={{ fill: "rgba(59,91,219,0.06)" }} content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[10, 10, 6, 6]}>
                {rows.map((item) => (
                  <Cell key={item.key} fill={item.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
      <p className="text-[#6e6e73]">{item.value} task{item.value === 1 ? "" : "s"}</p>
    </div>
  );
}
