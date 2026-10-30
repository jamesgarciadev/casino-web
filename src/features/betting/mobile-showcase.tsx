import { Bell, Smartphone, Wifi } from "lucide-react";
import Image from "next/image";

import androidSample from "@/assets/sample-android.png";
import iosSample from "@/assets/sample-ios.png";

const FEATURES = [
  { icon: Wifi, title: "Live odds", copy: "Scores and prices update while the map is still running." },
  { icon: Smartphone, title: "One-tap slips", copy: "Tap an odds button and the slip is ready to confirm." },
  { icon: Bell, title: "Match alerts", copy: "Get pinged when your team's series goes live." },
];

const PHONES = [
  { src: androidSample, alt: "Android app showing live matches and odds", caption: "Android app", offset: "" },
  { src: iosSample, alt: "iOS app showing a bet slip with stake and payout", caption: "iOS app", offset: "sm:mt-10" },
];

export function MobileShowcase() {
  return (
    <section className="relative overflow-hidden border-t border-border/70 py-20">
      <div className="arena-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-primary">Mobile apps</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase sm:text-4xl">
            Take the arena <span className="text-primary">with you</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Android and iOS, same crimson look, same one-tap bet slips, sized for your thumb.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap items-start justify-center gap-10">
          {PHONES.map((phone) => (
            <figure key={phone.caption} className={`text-center ${phone.offset}`}>
              <Image
                src={phone.src}
                alt={phone.alt}
                sizes="(min-width: 640px) 288px, 240px"
                className="w-60 rounded-3xl border border-border shadow-[0_30px_80px_-30px_var(--primary)] sm:w-72"
              />
              <figcaption className="mt-4 font-display text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
                {phone.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border bg-card/60 p-5 text-center">
              <feature.icon className="mx-auto size-6 text-accent" />
              <h3 className="mt-3 font-display text-sm font-bold uppercase">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
