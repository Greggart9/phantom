import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';

export interface JournalArticleItem {
  id: string;
  category: string;
  readTime: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  slug: string;
}

const DEFAULT_ARTICLES: JournalArticleItem[] = [
  {
    id: 'journal-1',
    category: 'PHILOSOPHY',
    readTime: '6 MIN READ',
    title: 'The Case for Fewer, Better Things',
    excerpt:
      'We ran the numbers on a decade of wear. The expensive coat was the cheap one.',
    imageUrl:
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
    slug: 'the-case-for-fewer-better-things'
  },
  {
    id: 'journal-2',
    category: 'CRAFT',
    readTime: '8 MIN READ',
    title: 'Inside the Mill: Making the Halden',
    excerpt:
      'Three days in Biella, watching two faces of wool become one piece of cloth.',
    imageUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
    slug: 'inside-the-mill-making-the-halden'
  },
  {
    id: 'journal-3',
    category: 'CARE',
    readTime: '4 MIN READ',
    title: 'How to Care for Cashmere',
    excerpt:
      'Wash it more, dry-clean it less, and stop hanging your knits. A short, opinionated guide.',
    imageUrl:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85',
    slug: 'how-to-care-for-cashmere'
  }
];

interface JournalSectionProps {
  articles?: JournalArticleItem[];
  className?: string;
}

export default function JournalSection({
  articles: initialArticles,
  className = ''
}: JournalSectionProps) {
  const [articles, setArticles] = useState<JournalArticleItem[]>(
    initialArticles || DEFAULT_ARTICLES
  );

  // Live Query: fetch latest journal articles from API
  useEffect(() => {
    if (initialArticles) return;

    let isMounted = true;
    api
      .get('/journal?limit=3')
      .then((res: any) => {
        if (!isMounted) return;
        const posts = res.data?.posts;
        if (Array.isArray(posts) && posts.length > 0) {
          const mapped: JournalArticleItem[] = posts.map((p: any, idx: number) => {
            const curated =
              DEFAULT_ARTICLES.find((a) => a.slug === p.slug) ||
              DEFAULT_ARTICLES[idx % DEFAULT_ARTICLES.length];
            return {
              id: p.id,
              category: p.category || curated.category,
              readTime: p.readTime || curated.readTime,
              title: p.title,
              excerpt: p.excerpt || (p.content ? p.content.slice(0, 95) + '...' : curated.excerpt),
              imageUrl: p.coverImage || curated.imageUrl,
              slug: p.slug
            };
          });

          const apiSlugs = new Set(mapped.map((m) => m.slug));
          const remainingDefaults = DEFAULT_ARTICLES.filter((a) => !apiSlugs.has(a.slug));
          const combined = [...mapped, ...remainingDefaults].slice(0, 3);
          setArticles(combined);
        }
      })
      .catch(() => {
        // Fallback to high-fidelity defaults
      });

    return () => {
      isMounted = false;
    };
  }, [initialArticles]);

  return (
    <section className={`w-full bg-[#121110] pt-0 pb-20 sm:pb-28 px-6 sm:px-10 lg:px-12 select-none ${className}`}>
      <div className="max-w-[1320px] mx-auto border-t border-white/10 pt-14 sm:pt-20">
        {/* Section Header matching screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-6"
        >
          <div className="space-y-3 sm:space-y-4">
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#cf5230]">
              FROM THE JOURNAL
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.12]">
              Notes on making and keeping
            </h2>
          </div>

          <div className="sm:pb-1">
            <Link
              to="/journal"
              className="inline-block text-[11px] font-semibold tracking-[0.22em] uppercase underline underline-offset-4 text-neutral-300 hover:text-[#cf5230] transition-colors duration-300"
            >
              ALL ENTRIES
            </Link>
          </div>
        </motion.div>

        {/* 3-Column Articles Grid with Jumpy Spring Scale Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 justify-items-center">
          {articles.slice(0, 3).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{
                scale: 1.035,
                y: -6,
                transition: {
                  type: 'spring',
                  stiffness: 550, // snappy, high-energy jump
                  damping: 11,    // low damping creates the signature tactile 'jumpy' overshoot
                  mass: 0.8
                }
              }}
              whileTap={{ scale: 0.98 }}
              transition={{
                opacity: { duration: 0.6, delay: idx * 0.1 },
                y: { duration: 0.6, delay: idx * 0.1 },
                default: {
                  type: 'spring',
                  stiffness: 400,
                  damping: 24
                }
              }}
              className="group block cursor-pointer will-change-transform w-full max-w-[421px] lg:w-[421px] lg:h-[463px]"
            >
              <Link to={`/journal/${item.slug}`} className="block h-full flex flex-col justify-between">
                {/* 1. Article Image Container (421 x 311) */}
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
                    {/* 2. Article Metadata (Category & Read Time) */}
                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase">
                      <span className="text-[#cf5230]">{item.category}</span>
                      <span className="text-neutral-500">&bull;</span>
                      <span className="text-neutral-400">{item.readTime}</span>
                    </div>

                    {/* 3. Article Title */}
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mt-2.5 mb-2 group-hover:text-neutral-200 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  {/* 4. Article Excerpt */}
                  <p className="text-xs sm:text-[17px] text-neutral-300 font-normal leading-relaxed line-clamp-2">
                    {item.excerpt}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
