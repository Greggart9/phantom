import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { JOURNAL_ARTICLES, type JournalArticleItem } from '../../data/journalData';

export default function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<JournalArticleItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [allArticles, setAllArticles] = useState<JournalArticleItem[]>(JOURNAL_ARTICLES);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Fetch article data with robust curated fallback
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Initial match from curated data
    const localMatch = JOURNAL_ARTICLES.find((a) => a.slug === slug) || null;
    if (localMatch) {
      setArticle(localMatch);
      setLoading(false);
    }

    // Try live API query
    api
      .get(`/journal/${slug}`)
      .then((res: any) => {
        if (!isMounted) return;
        const post = res.data?.post;
        if (post) {
          setArticle((prev) => ({
            id: post.id,
            category: post.category || prev?.category || 'CRAFT',
            date: post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }).toUpperCase()
              : prev?.date || 'MAY 2, 2026',
            readTime: post.readTime || prev?.readTime || '8 MIN READ',
            author: post.author || prev?.author || 'INES KARLSSON',
            title: post.title,
            excerpt: post.excerpt || prev?.excerpt || '',
            imageUrl: post.coverImage || prev?.imageUrl || '',
            slug: post.slug,
            contentSections: post.content
              ? post.content.split(/\n\n+/).map((para: string, idx: number) => ({
                  heading: idx === 0 ? '' : '',
                  paragraphs: [para.trim()]
                }))
              : prev?.contentSections || []
          }));
        }
      })
      .catch(() => {
        // Retain curated local article
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Also fetch all articles to update prev/next and Keep Reading if API has more
    api
      .get('/journal?limit=20')
      .then((res: any) => {
        if (!isMounted) return;
        const posts = res.data?.posts;
        if (Array.isArray(posts) && posts.length > 0) {
          const mapped: JournalArticleItem[] = posts.map((p: any, idx: number) => {
            const fallback =
              JOURNAL_ARTICLES.find((a) => a.slug === p.slug) ||
              JOURNAL_ARTICLES[idx % JOURNAL_ARTICLES.length];
            return {
              id: p.id,
              category: p.category || fallback.category,
              date: p.publishedAt
                ? new Date(p.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }).toUpperCase()
                : fallback.date,
              readTime: p.readTime || fallback.readTime,
              author: p.author || fallback.author,
              title: p.title,
              excerpt: p.excerpt || fallback.excerpt,
              imageUrl: p.coverImage || fallback.imageUrl,
              slug: p.slug,
              contentSections: fallback.contentSections
            };
          });

          const apiSlugs = new Set(mapped.map((m) => m.slug));
          const remainingCurated = JOURNAL_ARTICLES.filter((a) => !apiSlugs.has(a.slug));
          const combined = [...mapped, ...remainingCurated];

          setAllArticles(combined);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#121110] text-[#f4f2ee] flex items-center justify-center">
        <p className="text-neutral-400 tracking-widest text-xs uppercase">Loading chronicle...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[70vh] bg-[#121110] text-[#f4f2ee] flex flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-3">
          Phantom Journal
        </p>
        <h1 className="text-3xl sm:text-4xl font-normal tracking-tight text-white mb-4">
          Essay Not Found
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
          The requested chronicle does not exist in our journal or may have been unlisted from the current edition.
        </p>
        <Link
          to="/journal"
          className="px-8 py-3.5 bg-white text-neutral-950 text-xs font-bold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors"
        >
          BROWSE ALL ESSAYS
        </Link>
      </div>
    );
  }

  // Determine current index and adjacent articles for navigation
  const currentIndex = allArticles.findIndex((a) => a.slug === article.slug);
  const prevArticle =
    currentIndex > 0
      ? allArticles[currentIndex - 1]
      : allArticles[allArticles.length - 1]; // wrap to end if first
  const nextArticle =
    currentIndex >= 0 && currentIndex < allArticles.length - 1
      ? allArticles[currentIndex + 1]
      : allArticles[0]; // wrap to start if last

  // 3 Articles for "Keep reading" section (exclude current article if possible)
  const keepReadingArticles = allArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#121110] text-[#f4f2ee] selection:bg-neutral-800 selection:text-white">
      <main className="pt-12 sm:pt-16 lg:pt-20 pb-24 sm:pb-32 px-6 sm:px-10 lg:px-12 select-none">
        <div className="max-w-[1320px] mx-auto">
          {/* 1 & 2. Centered Top Navigation & Header Information */}
          <div className="max-w-[760px] mx-auto mb-10 sm:mb-14">
            {/* Top Navigation: Back to All Entries */}
            <div className="mb-8 sm:mb-10">
              <Link
                to="/journal"
                className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] uppercase text-neutral-400 hover:text-white transition-colors duration-300 group"
              >
                <span className="transition-transform duration-300 group-hover:-translate-x-1">&lsaquo;</span>
                <span>ALL ENTRIES</span>
              </Link>
            </div>

            <header>
              <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#cf5230] mb-3 sm:mb-4">
                {article.category}
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-[1.08] mb-5 sm:mb-6">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="text-lg sm:text-xl text-neutral-300 font-normal leading-relaxed mb-6 sm:mb-8">
                  {article.excerpt}
                </p>
              )}

              {/* Author, Date & Read Time */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-[11px] font-bold tracking-[0.22em] uppercase text-neutral-400">
                <span className="text-neutral-200">{article.author}</span>
                <span className="text-neutral-500">&bull;</span>
                <span>{article.date}</span>
                <span className="text-neutral-500">&bull;</span>
                <span>{article.readTime}</span>
              </div>
            </header>
          </div>

          {/* 3. Hero Featured Image (Exact 1320px x 776px responsive ratio) */}
          <div className="relative w-full max-w-[1320px] mx-auto aspect-[1320/776] lg:h-[776px] overflow-hidden bg-neutral-900 shadow-2xl mb-14 sm:mb-20">
            <img
              src={article.imageUrl}
              alt={article.title}
              width={1320}
              height={776}
              loading="eager"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* 4. Centered Article Editorial Content with Scroll-Up Animation */}
          <article className="max-w-[760px] mx-auto">
            {(article.contentSections || []).map((section, idx) => (
              <motion.section
                key={idx}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.65,
                  ease: [0.21, 0.47, 0.32, 0.98]
                }}
                className="mb-12 sm:mb-16"
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight mb-5 sm:mb-6">
                  {section.heading}
                </h2>
                <div className="space-y-5 sm:space-y-6">
                  {section.paragraphs.map((p, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-base sm:text-[18px] text-neutral-300 font-normal leading-[1.75]"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </motion.section>
            ))}
          </article>

          {/* 5. Centered Horizontal Divider Line & Prev/Next Journal Navigation */}
          <div className="max-w-[760px] mx-auto pt-4 sm:pt-6">
            <div className="border-t border-white/10 mb-8 sm:mb-10" />

            <nav aria-label="Journal navigation" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              {/* Previous Article Button */}
              {prevArticle && (
                <Link
                  to={`/journal/${prevArticle.slug}`}
                  className="group inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-[#cf5230] transition-colors duration-300"
                >
                  <span className="text-sm leading-none transition-transform duration-300 group-hover:-translate-x-1">&lsaquo;</span>
                  <span className="underline underline-offset-4 decoration-transparent group-hover:decoration-[#cf5230] transition-all duration-300">
                    {prevArticle.title}
                  </span>
                </Link>
              )}

              {/* Next Article Button */}
              {nextArticle && (
                <Link
                  to={`/journal/${nextArticle.slug}`}
                  className="group inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 hover:text-[#cf5230] transition-colors duration-300 sm:text-right ml-auto"
                >
                  <span className="underline underline-offset-4 decoration-transparent group-hover:decoration-[#cf5230] transition-all duration-300">
                    {nextArticle.title}
                  </span>
                  <span className="text-sm leading-none transition-transform duration-300 group-hover:translate-x-1">&rsaquo;</span>
                </Link>
              )}
            </nav>
          </div>

          {/* 6. Keep Reading Section (3 Cards Grid matching JournalSection) */}
          <section aria-label="Keep reading" className="mt-20 sm:mt-28 pt-14 sm:pt-20 border-t border-white/10">
            <div className="mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Keep reading
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 justify-items-center">
              {keepReadingArticles.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{
                    scale: 1.035,
                    y: -6,
                    transition: {
                      type: 'spring',
                      stiffness: 550, // snappy, high-energy jump
                      damping: 11,    // signature tactile overshoot
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
          </section>
        </div>
      </main>
    </div>
  );
}
