export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-widest text-black/50 uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
      {subtitle ? <p className="text-black/60 max-w-2xl">{subtitle}</p> : null}
    </div>
  );
}