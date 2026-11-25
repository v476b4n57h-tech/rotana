import { mood, moodNote } from "@/content/rotana";
import { t } from "@/i18n";
import { Slider } from "./Slider";

export function MoodSliders() {
  return (
    <section id="sfeer" aria-label={t("mood.sectionLabel")}>
      <div className="wrap reveal" style={{ paddingBlock: 40 }}>
        <div className="duo">
          {mood.map((panel, k) => (
            <div className="panel" key={panel.group}>
              <h3>{panel.title}</h3>
              <div className="note">{panel.note}</div>
              <Slider slides={panel.slides} groupLabel={panel.title.toLowerCase()} index={k} />
            </div>
          ))}
        </div>
        <div className="note" style={{ marginTop: 14 }}>
          {moodNote}
        </div>
      </div>
    </section>
  );
}
