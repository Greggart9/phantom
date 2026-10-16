import { useEffect } from 'react';
import SEO from '../../components/common/SEO';

interface PrivacySection {
  title: string;
  paragraphs: string[];
}

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: 'What we collect',
    paragraphs: [
      'When you place an order we collect your name, delivery and billing address, email address, telephone number and the contents of your order. When you subscribe to the letter we collect your email address only.',
      'We never see or store full card numbers. Payments are processed by Stripe, who hold that data under their own terms.'
    ]
  },
  {
    title: 'Why we collect it',
    paragraphs: [
      'To fulfil the order, to tell you where the parcel is, to handle returns and repairs, and to meet the accounting obligations placed on us by Portuguese law. Marketing email is sent only where you have asked for it, and every message carries a one-click unsubscribe.'
    ]
  },
  {
    title: 'Who we share it with',
    paragraphs: [
      'Our carrier, our payment processor, our email provider and our accountant — each only with what they need to do their part, and none of them with permission to use it for anything else. We do not sell data to anyone, ever.'
    ]
  },
  {
    title: 'How long we keep it',
    paragraphs: [
      'Order records are kept for ten years because tax law requires it. Marketing preferences are kept until you withdraw them. Anything else is deleted within twelve months of your last interaction with us.'
    ]
  },
  {
    title: 'Your rights',
    paragraphs: [
      'Under the GDPR you may ask for a copy of everything we hold about you, ask us to correct it, or ask us to delete it. Write to privacy@phantom.studio and we will respond inside thirty days, usually much sooner.'
    ]
  },
  {
    title: 'Cookies',
    paragraphs: [
      'We use one essential cookie to remember the contents of your bag, and anonymous analytics that do not identify you. There is no advertising pixel on this site.'
    ]
  }
];

export default function PrivacyPolicyPage() {
  // Scroll to top upon navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#11100f] text-[#f4f2ee] select-none py-14 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-16 selection:bg-neutral-800 selection:text-white">
      <SEO
        title="Privacy Policy"
        description="Phantom Studio privacy policy, GDPR compliance, and how we handle customer personal data."
      />
      <div className="max-w-[1320px] mx-auto">
        {/* ========================================================= */}
        {/* TOP HEADER: Left-aligned to the screen / container        */}
        {/* ========================================================= */}
        <header className="space-y-4 pb-12 border-b border-white/10">
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#cf5230]">
            LEGAL
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.08]">
            Privacy policy
          </h1>
          <p className="text-base sm:text-[18px] text-neutral-400 font-medium max-w-md leading-relaxed pt-1">
            What we collect, why we collect it, and how to make us delete it. Written to be read rather than skipped.
          </p>
          <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-neutral-500 font-semibold pt-2">
            LAST UPDATED 4 AUGUST 2026
          </p>
        </header>

        {/* ========================================================= */}
        {/* BODY CONTENT: Centered below the border                   */}
        {/* Starting from "What we collect" down to "Cookies"         */}
        {/* ========================================================= */}
        <main className="flex justify-center pt-16 sm:pt-20 pb-16">
          <div className="w-full max-w-3xl space-y-14 sm:space-y-16">
            {PRIVACY_SECTIONS.map((section) => (
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
