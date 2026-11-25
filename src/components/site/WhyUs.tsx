import { whyUs } from "@/content/rotana";

export function WhyUs() {
  return (
    <section id="over-ons" className="why">
      <div className="wrap reveal" style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        <h2>{whyUs.title}</h2>
        <div className="row">
          {whyUs.items.map((item) => (
            <div className="col" key={item.title}>
              <h3 style={{ fontWeight: 600, fontSize: 26 }}>{item.title}</h3>
              <p style={{ margin: "8px 0 0" }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
