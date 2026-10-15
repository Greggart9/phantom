import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  category: string;
  items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    category: 'Orders',
    items: [
      {
        question: 'When will my order ship?',
        answer:
          'Orders placed before 14:00 WET on a working day leave our Lisbon studio the same day. Orders placed after 14:00 or over the weekend dispatch the next working day. You will receive an email with live carrier tracking as soon as your parcel is scanned.'
      },
      {
        question: 'Can I change or cancel an order?',
        answer:
          'We pack pieces quickly once an order is confirmed. If you need to make changes or cancel, email hello@phantom.studio within one hour of ordering and we will do our best to adjust it before dispatch. If it has already shipped, you can return it within thirty days.'
      },
      {
        question: 'Do you offer gift wrapping?',
        answer:
          'Every order is packaged with care in unbleached archival tissue inside a rigid recyclable box tied with cotton twill tape. No pricing is included in the shipment. You can add a personalized handwritten note at checkout in the order instructions field.'
      }
    ]
  },
  {
    category: 'Shipping',
    items: [
      {
        question: 'Which countries do you ship to?',
        answer:
          'We ship to every country served by DHL Express and our carbon-neutral European courier network. Complimenary standard delivery is included on orders above €200 within the EU and UK, and above €350 internationally.'
      },
      {
        question: 'How long does delivery take?',
        answer:
          'Standard shipping takes 2 to 4 working days within the EU and UK, and 5 to 8 working days for the rest of the world. Express shipping options (1 to 2 business days) are shown at checkout once you provide your shipping address.'
      },
      {
        question: 'Will I pay customs or duties?',
        answer:
          'All orders delivered to the European Union, the United Kingdom, and the United States include all duties, import fees, and local VAT — there are no additional charges on arrival. For other destinations, duties are collected by the carrier according to local customs regulations.'
      }
    ]
  },
  {
    category: 'Returns',
    items: [
      {
        question: 'What is your returns policy?',
        answer:
          'You have thirty days from the delivery date to return any item in its original, unworn condition with tags attached. Returns are free within the EU and UK; for the rest of the world, a flat €15 fee is deducted from the refund to cover return carriage.'
      },
      {
        question: 'How do I book a return?',
        answer:
          'You can initiate a return through the link in your dispatch confirmation email. Generate a prepaid shipping label or digital QR code, drop the package at any carrier location, and your refund will process within five working days of receipt at our studio.'
      },
      {
        question: 'Can I exchange an item?',
        answer:
          'The fastest exchange is a return plus a new order — it guarantees your size is reserved before it sells out. If the size you need is out of stock, write to hello@phantom.studio and we will hold a piece from our upcoming workshop batch for you.'
      }
    ]
  },
  {
    category: 'Care & repairs',
    items: [
      {
        question: 'Do you offer a repair service?',
        answer:
          'Yes. Seams, buttons, zips, and linings are repaired free of charge for the first two years. Beyond that, we provide restorations at material cost and postage. Send a photograph to hello@phantom.studio before sending anything.'
      },
      {
        question: 'How do I care for wool and cashmere?',
        answer:
          'Natural wool and cashmere self-clean when aired outdoors in fresh breeze. When washing is necessary, hand wash gently in lukewarm water using mild pH-neutral wool wash, reshape gently while damp, and dry flat away from direct heat.'
      },
      {
        question: 'Can I order replacement buttons or hardware?',
        answer:
          'We keep spare horn buttons, custom brass snaps, and spare threads for every collection we produce. Contact our studio with your order number and garment name, and we will post replacement hardware to you with our compliments.'
      }
    ]
  }
];

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-[#11100f] text-[#f4f2ee] select-none selection:bg-neutral-800 selection:text-white">
      <div className="max-w-[1320px] mx-auto pt-14 sm:pt-20 lg:pt-24 pb-16 sm:pb-24 px-6 sm:px-10 lg:px-16">
        {/* ========================================================= */}
        {/* TOP HEADER: Eyebrow + Title & Intro Text                  */}
        {/* ========================================================= */}
        <header className="pb-10 sm:pb-14 border-b border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
            <div className="lg:col-span-7 space-y-3">
              <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#cf5230]">
                HELP CENTRE
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.08]">
                Frequent questions
              </h1>
            </div>

            <div className="lg:col-span-5 lg:pl-6">
              <p className="text-base sm:text-[18px] text-neutral-400 font-medium leading-relaxed max-w-md">
                Everything about orders, delivery, returns and looking after what you buy. Still stuck?{' '}
                <Link
                  to="/contact"
                  className="text-white hover:text-[#cf5230] underline underline-offset-4 decoration-white/30 hover:decoration-[#cf5230] transition-colors"
                >
                  Write to us
                </Link>{' '}
                and a person will answer.
              </p>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* FAQ SECTIONS: Category on Left, Accordion List on Right   */}
        {/* ========================================================= */}
        <main className="pt-14 sm:pt-20 pb-20 space-y-16 sm:space-y-24">
          {FAQ_DATA.map((group) => (
            <div
              key={group.category}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start"
            >
              {/* Category Title (Left) */}
              <div className="lg:col-span-4">
                <h2 className="text-2xl sm:text-[32px] font-normal text-white tracking-tight">
                  {group.category}
                </h2>
              </div>

              {/* Accordion Items (Right) */}
              <div className="lg:col-span-8 border-t border-white/10">
                {group.items.map((item, index) => {
                  const key = `${group.category}-${index}`;
                  const isOpen = !!openItems[key];

                  return (
                    <div key={item.question} className="border-b border-white/10">
                      <button
                        type="button"
                        onClick={() => toggleItem(key)}
                        aria-expanded={isOpen}
                        className="w-full py-5 sm:py-6 flex items-center justify-between text-left group cursor-pointer transition-colors"
                      >
                        <span className="text-base sm:text-[17px] font-medium text-white group-hover:text-neutral-300 transition-colors pr-6">
                          {item.question}
                        </span>
                        <span className="shrink-0 text-white transition-transform duration-200">
                          <Plus
                            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${
                              isOpen ? 'rotate-45 text-[#cf5230]' : 'text-white'
                            }`}
                          />
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pb-6 pr-6 sm:pr-12 text-sm sm:text-[15px] text-neutral-400 font-normal leading-relaxed">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </main>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM SECTION: "Still stuck? Ask a person."              */}
      {/* Seamlessly merges with the footer (same #f6f5f0 color)    */}
      {/* ========================================================= */}
      <section className="w-full bg-[#f6f5f0] text-neutral-900 border-t border-black/10 py-20 sm:py-28 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-neutral-950">
            Still stuck? Ask a person.
          </h2>
          <div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#121110] hover:bg-neutral-800 text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 transition-colors shadow-md"
            >
              <span>CONTACT THE STUDIO</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
