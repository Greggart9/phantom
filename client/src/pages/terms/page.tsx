import { useEffect } from 'react';

interface TermsSection {
  title: string;
  paragraphs: string[];
}

const TERMS_SECTIONS: TermsSection[] = [
  {
    title: 'Who we are',
    paragraphs: [
      'Phantom Studio, Lda., registered in Portugal, at Rua da Boavista 84, 1200-069 Lisboa. Company number PT510994410. You can reach a person at hello@phantom.studio.'
    ]
  },
  {
    title: 'Orders',
    paragraphs: [
      'An order is an offer to buy. The contract is formed when we send the dispatch confirmation, not when payment is taken. If a piece sells out between your order and our confirmation we will refund you in full and tell you when the next run is due.'
    ]
  },
  {
    title: 'Prices',
    paragraphs: [
      'Prices are shown in your local currency and include duties and taxes for the EU, UK and US. We may change prices at any time, but never after an order is confirmed.'
    ]
  },
  {
    title: 'Your right to cancel',
    paragraphs: [
      'Consumers in the EU and UK may cancel within fourteen days of delivery without giving a reason. Our own returns policy is more generous — thirty days — and applies in addition to that right, not instead of it.'
    ]
  },
  {
    title: 'Warranty',
    paragraphs: [
      'Everything we make is guaranteed against manufacturing fault for two years. This does not cover ordinary wear, accidental damage or alterations made by someone else.'
    ]
  },
  {
    title: 'Governing law',
    paragraphs: [
      'These terms are governed by Portuguese law. Nothing here limits your statutory rights as a consumer.'
    ]
  }
];

export default function TermsOfServicePage() {
  // Scroll to top on navigation
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
            LEGAL
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.08]">
            Terms of service
          </h1>
          <p className="text-base sm:text-[18px] text-neutral-400 font-medium max-w-md leading-relaxed pt-1">
            The agreement between you and Phantom Studio, Lda. when you buy something from this site.
          </p>
          <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-neutral-500 font-semibold pt-2">
            LAST UPDATED 4 AUGUST 2026
          </p>
        </header>

        {/* ========================================================= */}
        {/* BODY CONTENT: Centered below the border                   */}
        {/* Starting from "Who we are" down to "Governing law"        */}
        {/* ========================================================= */}
        <main className="flex justify-center pt-16 sm:pt-20 pb-16">
          <div className="w-full max-w-3xl space-y-14 sm:space-y-16">
            {TERMS_SECTIONS.map((section) => (
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
