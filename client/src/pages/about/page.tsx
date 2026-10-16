import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import SEO from '../../components/common/SEO';

const TEAM_MEMBERS = [
  {
    name: 'Ines Karlsson',
    role: 'FOUNDER & PATTERN',
    imageUrl: 'https://res.cloudinary.com/degearesj/image/upload/v1792109981/asset5_1_swgwd7.jpg'
  },
  {
    name: 'Tomas Reiner',
    role: 'KNITWEAR & REPAIRS',
    imageUrl: 'https://res.cloudinary.com/degearesj/image/upload/v1792109982/asset3_4_kbwoxd.jpg'
  },
  {
    name: 'Aurélie Dumas',
    role: 'LEATHER & FINISHING',
    imageUrl: 'https://res.cloudinary.com/degearesj/image/upload/v1792109982/asset4_3_nlosjq.jpg'
  }
];

const PILLARS = [
  {
    num: '01 — MATERIAL',
    title: 'Named, traced, boring',
    description:
      'We publish the mill, the tannery and the workshop for every piece. If we cannot name it, we do not sell it.'
  },
  {
    num: '02 — METHOD',
    title: 'Small runs, no reorders',
    description:
      'One hundred to four hundred pieces per run. When it is gone we wait for the right cloth rather than substitute it.'
  },
  {
    num: '03 — AFTERLIFE',
    title: 'Repair before replace',
    description:
      'Free repairs for two years, at cost after that, for as long as we can source the parts.'
  }
];

export default function AboutPage() {
  // Scroll to top upon navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#121110] text-[#f4f2ee] selection:bg-neutral-800 selection:text-white">
      <SEO
        title="Atelier Heritage & Craft"
        description="Discover Phantom's craft ethos, European mill partnerships, and lifetime care commitment."
      />
      <main className="pt-16 sm:pt-24 lg:pt-28 pb-24 sm:pb-32 px-6 sm:px-10 lg:px-12 select-none">
        <div className="max-w-[1320px] mx-auto">
          {/* 1. Top Section: The Studio Header */}
          <section aria-label="The Studio Header" className="mb-12 sm:mb-16">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-3 sm:space-y-4">
                <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#cf5230]">
                  THE STUDIO
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.08] max-w-xl">
                  Eleven people, <br />
                  four mills, one idea
                </h1>
              </div>

              <p className="text-sm sm:text-base lg:text-[18px] text-neutral-400 font-normal leading-relaxed max-w-md lg:pb-1">
                Phantom began in 2016 in a two-room studio in Lisbon, with one coat and a list of
                mills who would answer the phone. Not much has changed except the number of coats.
              </p>
            </div>
          </section>

          {/* 2. Large Studio & Loom Image (Exact 1320px x 776px ratio from Journal Slug) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative w-full max-w-[1320px] mx-auto aspect-[1320/776] lg:h-[776px] overflow-hidden bg-neutral-900 shadow-2xl mb-20 sm:mb-28"
          >
            <img
              src="https://res.cloudinary.com/degearesj/image/upload/v1792109982/asset2_4_ixhcxb.jpg"
              alt="Weaving loom in Phantom mill"
              width={1320}
              height={776}
              loading="eager"
              className="w-full h-full object-cover object-center"
            />
          </motion.div>

          {/* 3. Section: "We would rather make one coat properly..." */}
          <motion.section
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
            aria-label="Philosophy"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-20 sm:mb-28"
          >
            <div className="lg:col-span-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-[1.14]">
                We would rather make one coat properly than six of them quickly.
              </h2>
            </div>

            <div className="lg:col-span-6 space-y-6 text-sm sm:text-[17px] text-neutral-300 font-normal leading-relaxed">
              <p>
                Every piece is produced in a single run, at a mill or workshop we have visited,
                with a maker whose name we can tell you. When a run sells out we do not rush a
                reorder — we wait until the same cloth is available at the same quality, which is
                sometimes a season away.
              </p>
              <p>
                That is slower and more expensive than the alternative. It is also the only way we
                know to make something worth repairing, and repair is where the whole argument
                stands or falls. We have mended two thousand four hundred pieces since 2019, most
                of them free.
              </p>
            </div>
          </motion.section>

          {/* 4. Section: "01 Material, 02 Method, 03 Afterlife" */}
          <motion.section
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
            aria-label="Phantom Pillars"
            className="border-t border-white/10 pt-10 sm:pt-14 mb-24 sm:mb-32"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
              {PILLARS.map((pillar) => (
                <div key={pillar.num} className="space-y-3 sm:space-y-4">
                  <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#cf5230]">
                    {pillar.num}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 5. Section: Team ("The people who make it") */}
          <motion.section
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
            aria-label="The Team"
            className="mb-24 sm:mb-36"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white tracking-tight mb-10 sm:mb-12">
              The people who make it
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {TEAM_MEMBERS.map((member) => (
                <div key={member.name} className="group">
                  {/* Portrait Container */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900 shadow-md">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center will-change-transform transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  </div>

                  {/* Member Name & Role */}
                  <div className="pt-4 sm:pt-5">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {member.name}
                    </h3>
                    <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-neutral-400 mt-1">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 6. Section: Final CTA ("Come and see what nine years...") */}
          <motion.section
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
            aria-label="Shop Range Call to Action"
            className="py-12 sm:py-16 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight max-w-2xl mx-auto mb-8 sm:mb-10">
              Come and see what nine <br className="hidden sm:inline" />
              years of one coat looks like.
            </h2>

            {/* CTA Button:
                Hover turns background into orange (#cf5230), text remains black, navigates to /shop */}
            <div className="flex justify-center">
              <Link
                to="/shop"
                className="bg-[#f4f2ee] hover:bg-[#cf5230] text-black font-bold text-xs uppercase tracking-[0.2em] px-8 sm:px-10 py-4 transition-colors duration-300 inline-flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <span>SHOP THE RANGE</span>
                <ArrowUpRight className="w-4 h-4 text-black" />
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
