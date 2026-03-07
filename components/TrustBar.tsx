import Container from "@/components/Container";

const ITEMS = [
  { title: "Fast delivery", desc: "Quick dispatch & updates." },
  { title: "Order tracking", desc: "Track with Order ID + phone." },
  { title: "Cusotmer Support", desc: "24/7 Customer Support." },
  { title: "Quality products", desc: "Clean catalog experience." },
];

export default function TrustBar() {
  return (
    <section className="border-b border-black/10 bg-white">
      <Container>
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map((x) => (
            <div key={x.title} className="rounded-2xl border border-black/10 p-5">
              <p className="font-semibold">{x.title}</p>
              <p className="mt-1 text-sm text-black/60">{x.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}