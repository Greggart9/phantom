import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';

import { JOURNAL_ARTICLES, type JournalArticleItem } from '../../data/journalData';

export default function JournalPage() {
  const [articles, setArticles] = useState<JournalArticleItem[]>(JOURNAL_ARTICLES);
  const [visibleEarlierCount, setVisibleEarlierCount] = useState(3);

  // Live Query: fetch journal posts from API with fallback
  useEffect(() => {
    let isMounted = true;
    api
      .get('/journal?limit=20')
      .then((res: any) => {
        if (!isMounted) return;
        const posts = res.data?.posts;
        if (Array.isArray(posts) && posts.length > 0) {
          const mapped: JournalArticleItem[] = posts.map((p: any, idx: number) => {
            const curated =
              JOURNAL_ARTICLES.find((a) => a.slug === p.slug) ||
              JOURNAL_ARTICLES[idx % JOURNAL_ARTICLES.length];
            return {
              id: p.id,
              category: p.category || curated.category,
              date: p.publishedAt
                ? new Date(p.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }).toUpperCase()
                : curated.date,
              readTime: p.readTime || curated.readTime,
              author: p.author || curated.author,
              title: p.title,
              excerpt: p.excerpt || (p.content ? p.content.slice(0, 110) + '...' : curated.excerpt),
              imageUrl: p.coverImage || curated.imageUrl,
              slug: p.slug,
              contentSections: curated.contentSections
            };
          });

          // Merge API posts with any curated articles not yet returned in API
          const apiSlugs = new Set(mapped.map((m) => m.slug));
          const remainingCurated = JOURNAL_ARTICLES.filter((a) => !apiSlugs.has(a.slug));
          const combined = [...mapped, ...remainingCurated];

          setArticles(combined);
        }
      })
      .catch(() => {
        // Retain curated articles fallback
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Split into Featured (most recent, index 0) and Earlier entries (index 1+)
  const featuredArticle = articles[0];
  const earlierEntries = articles.slice(1);
  const displayedEarlierEntries = earlierEntries.slice(0, visibleEarlierCount);
  const hasMoreEarlier = earlierEntries.length > visibleEarlierCount;

  const handleLoadMore = () => {
    setVisibleEarlierCount((prev) => prev + 3);
  };

  return (
    <div className="min-h-screen bg-[#121110] text-[#f4f2ee] selection:bg-neutral-800 selection:text-white">
      <main className="pt-16 sm:pt-24 lg:pt-28 pb-20 sm:pb-28 px-6 sm:px-10 lg:px-12 select-none">
        <div className="max-w-[1320px] mx-auto">
          {/* 1. Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-12 sm:mb-14"
          >
            <div className="space-y-3 sm:space-y-4">
              <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#cf5230]">
                THE JOURNAL
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.1]">
                Notes on making and keeping
              </h1>
            </div>

            <p className="text-sm sm:text-[18px] text-neutral-400 font-semibold leading-relaxed max-w-sm lg:pb-1">
              Dispatches from Phantom on material, longevity, and the discipline of restraint.
            </p>
          </motion.div>

          {/* Border line respecting 1320px max-width */}
          <div className="border-b border-white/10 mb-12 sm:mb-16" />

          {/* 2. Featured Post (Center Top - Most Recent) */}
          {featuredArticle && (
            <motion.section
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              aria-label="Featured Story"
              className="mb-16 sm:mb-25"
            >
              <Link
                to={`/journal/${featuredArticle.slug}`}
                className="group block cursor-pointer"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Featured Image */}
                  <div className="lg:col-span-6">
                    <div className="relative aspect-[16/12] w-full overflow-hidden bg-neutral-900 shadow-md">
                      <img
                        src={featuredArticle.imageUrl}
                        alt={featuredArticle.title}
                        loading="eager"
                        className="w-full h-full object-cover object-center will-change-transform transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Featured Details */}
                  <div className="lg:col-span-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase">
                      <span className="text-[#cf5230]">{featuredArticle.category}</span>
                      {featuredArticle.date && (
                        <>
                          <span className="text-neutral-500">&bull;</span>
                          <span className="text-neutral-400">{featuredArticle.date}</span>
                        </>
                      )}
                      {featuredArticle.readTime && (
                        <>
                          <span className="text-neutral-500">&bull;</span>
                          <span className="text-neutral-400">{featuredArticle.readTime}</span>
                        </>
                      )}
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.18] mt-3.5 mb-4 group-hover:text-neutral-200 transition-colors">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-sm sm:text-[17px] text-neutral-300 font-normal leading-relaxed mb-6 sm:mb-8 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>

                    <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.22em] uppercase text-neutral-300 transition-colors duration-300 group-hover:text-[#cf5230]">
                      <span>READ THE ESSAY</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 text-inherit" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.section>
          )}

          {/* 3. Divider before Earlier entries respecting 1320px */}
          <div className="border-b border-white/10 mb-14 sm:mb-18" />

          {/* 4. Earlier Entries Section */}
          <section aria-label="Earlier Entries">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-10 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Earlier entries
              </h2>
            </motion.div>

            {/* 3-Column Articles Grid with Exact JournalSection.tsx Cards and Jumpy Spring Physics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 justify-items-center">
              {displayedEarlierEntries.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{
                    scale: 1.035,
                    y: -6,
                    transition: {
                      type: 'spring',
                      stiffness: 550, // snappy, high-energy jump
                      damping: 11,    // low damping creates signature tactile overshoot
                      mass: 0.8
                    }
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 24
                  }}
                  className="group block cursor-pointer will-change-transform w-full max-w-[421px] lg:w-[421px] lg:h-[463px]"
                >
                  <Link to={`/journal/${item.slug}`} className="block h-full flex flex-col justify-between">
                    {/* Article Image Container (421 x 311) */}
                    <div className="relative w-full max-w-[421px] lg:w-[421px] lg:h-[311px] aspect-[421/311] overflow-hidden bg-neutral-900 shadow-md shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        width={421}
                        height={311}
                        loading="lazy"
                        className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 flex flex-col justify-between pt-4">
                      <div>
                        {/* Article Metadata (Category & Read Time) */}
                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase">
                          <span className="text-[#cf5230]">{item.category}</span>
                          <span className="text-neutral-500">&bull;</span>
                          <span className="text-neutral-400">{item.readTime}</span>
                        </div>

                        {/* Article Title */}
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mt-2.5 mb-2 group-hover:text-neutral-200 transition-colors">
                          {item.title}
                        </h3>
                      </div>

                      {/* Article Excerpt */}
                      <p className="text-xs sm:text-[17px] text-neutral-300 font-normal leading-relaxed line-clamp-2">
                        {item.excerpt}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* 5. Conditional Load More Button: Only shown if there are remaining entries */}
            {hasMoreEarlier && (
              <div className="flex flex-col items-center justify-center mt-16 sm:mt-20 pt-8 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="px-10 py-4 border border-neutral-700 hover:border-white text-white text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white/5 active:scale-95 cursor-pointer shadow-lg"
                >
                  VIEW REMAINING ENTRIES ({earlierEntries.length - visibleEarlierCount} MORE)
                </button>
                <p className="text-[11px] text-neutral-400 font-normal mt-3">
                  Showing {displayedEarlierEntries.length + 1} of {articles.length} articles
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
