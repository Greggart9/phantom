import { useEffect } from 'react';

interface FaqSection {
  title: string;
  paragraphs: string[];
}

const SHIPPING_RETURNS_SECTIONS: FaqSection[] = [
  {
    title: 'Where we ship',
    paragraphs: [
      'We ship to every country served by our carriers, which is most of them. Prices are shown in your local currency at checkout and are converted at the day’s rate.',
      'Delivery is complimentary above €200 within the EU and the UK, and above €350 for the rest of the world. Below those thresholds a flat rate is calculated at checkout.'
    ]
  },
  {
    title: 'How long it takes',
    paragraphs: [
      'Orders placed before 14:00 WET on a working day leave our Lisbon studio the same day. Two to four working days for the EU and UK, five to eight elsewhere. Express options appear once you enter an address.',
      'Every parcel travels carbon-neutral. You will receive a tracking link as soon as the parcel is scanned.'
    ]
  },
  {
    title: 'Duties and taxes',
    paragraphs: [
      'Prices for the EU, UK and US include duties and taxes — there is nothing further to pay on delivery. For all other destinations, duties are collected by the carrier at the door and are set by your local customs authority, not by us.'
    ]
  },
  {
    title: 'Returns',
    paragraphs: [
      'You have thirty days from delivery to return anything unworn and with its tags attached. Returns are free within the EU and UK; elsewhere a flat €15 is deducted from the refund to cover the label.',
      'Start a return from the link in your dispatch email. Print the label or show the QR code at any drop-off point. Refunds are issued to the original payment method within five working days of the parcel reaching us.'
    ]
  },
  {
    title: 'Exchanges',
    paragraphs: [
      'The fastest exchange is a return plus a new order — it keeps your size reserved rather than waiting for the parcel to travel. If the piece you want is sold out, write to us and we will hold the next run for you.'
    ]
  },
  {
    title: 'Repairs',
    paragraphs: [
      'Seams, buttons, zips and linings are repaired free for the first two years. After that we charge parts and postage only. Send a photograph to hello@phantom.studio and we will tell you what is possible before you post anything.'
    ]
  }
];

export default function ShippingAndReturnsPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#11100f] text-[#f4f2ee] select-none py-14 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-16 selection:bg-neutral-800 selection:text-white">
      <div className="max-w-[1320px] mx-auto">
        {/* ========================================================= */}
        {/* TOP HEADER: Left-aligned to the screen / container        */}
        {/* ========================================================= */}
        <header className="space-y-4 pb-12 border-b border-white/10">
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#cf5230]">
            HELP CENTRE
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.08]">
            Shipping & returns
          </h1>
          <p className="text-base sm:text-[18px] text-neutral-400 font-medium max-w-md leading-relaxed pt-1">
            Where we ship, what it costs, how long it takes, and what happens when something is not right.
          </p>
          <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-neutral-500 font-semibold pt-2">
            LAST UPDATED 4 AUGUST 2026
          </p>
        </header>

        {/* ========================================================= */}
        {/* BODY CONTENT: Centered below the border                   */}
        {/* Starting from "Where we ship" down to "Repairs"           */}
        {/* ========================================================= */}
        <main className="flex justify-center pt-16 sm:pt-20 pb-16">
          <div className="w-full max-w-3xl space-y-14 sm:space-y-16">
            {SHIPPING_RETURNS_SECTIONS.map((section) => (
              <section key={section.title} className="space-y-4 text-left">
                <h2 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-white leading-snug">
                  {section.title}
                </h2>
                <div className="space-y-3 text-base sm:text-[17px] text-neutral-300 font-normal leading-relaxed">
                  {section.paragraphs.map((para, idx) => (
                    <p key={idx} className="text-neutral-300/90">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
