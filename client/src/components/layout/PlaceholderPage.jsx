export default function PlaceholderPage({ title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-black/10 bg-white p-10 text-center">
      <p className="text-lg font-semibold text-[#1d1d1f]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6e6e73]">{description}</p>
    </div>
  );
}
