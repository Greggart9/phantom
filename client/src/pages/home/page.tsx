import HeroSection from '../../components/section/HeroSection';
import ValuePropsSection from '../../components/section/ValuePropsSection';
import CollectionSection from '../../components/section/CollectionSection';
import ProductSection from '../../components/section/ProductSection';
import ThesisSection from '../../components/section/ThesisSection';
import MostWantedSection from '../../components/section/MostWantedSection';
import TestimonialsSection from '../../components/section/TestimonialsSection';
import JournalSection from '../../components/section/JournalSection';
import PreFooterSection from '../../components/section/PreFooterSection';
import SEO from '../../components/common/SEO';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0e0e10] text-[#f4f2ee] selection:bg-neutral-800 selection:text-white">
      <SEO
        title="Fine Goods & Atelier Editions"
        description="Archival apparel and considered leather goods, crafted in limited seasonal editions with historic European mills. Free two-year atelier repair promise."
      />
      {/* 1. Hero Banner with 5s Ken Burns Zoom & Staggered Text Entrance */}
      <HeroSection />

      {/* 2. Phantom Value Propositions (Free delivery, 30-day returns, 2-yr repairs, Traceable materials) */}
      <ValuePropsSection />

      {/* 3. Featured Collections (4 Cards with hover zoom, text lift, line reveal) */}
      <CollectionSection />

      {/* 4. New This Season (Product Cards with dual image crossfade, Add to Bag, Wishlist) */}
      <ProductSection />

      {/* 5. Phantom Thesis & Metrics (Live number counters & About page CTA) */}
      <ThesisSection />

      {/* 6. Most Wanted (Top 3 Best-selling Products) */}
      <MostWantedSection />

      {/* 7. Testimonials (Top 3 Recent Customer Reviews) */}
      <TestimonialsSection />

      {/* 8. Journal Section (3 Editorial Essays with jumpy spring hover scaling) */}
      <JournalSection />

      {/* 9. Pre-Footer Atelier Manifesto Section ("Buy less. Choose carefully.") */}
      <PreFooterSection />
    </div>
  );
}
