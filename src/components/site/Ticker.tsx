import { tickerWords } from "@/content/rotana";

/** Scrolling band of service names. The list is repeated 4× so the loop is seamless. */
export function Ticker() {
  const words = [...tickerWords, ...tickerWords, ...tickerWords, ...tickerWords];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="track">
        {words.map((word, i) => (
          <span key={i}>{word}</span>
        ))}
      </div>
    </div>
  );
}
