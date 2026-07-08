export default function ComingSoonCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-msc-ink">{title}</h2>
      <p className="mt-2 text-msc-muted">{subtitle}</p>
    </div>
  );
}

