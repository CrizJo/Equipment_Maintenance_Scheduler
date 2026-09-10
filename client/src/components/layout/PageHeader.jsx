export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[32px] font-semibold tracking-tight text-[#1d1d1f]">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-[#6e6e73]">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
