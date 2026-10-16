import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  schema?: Record<string, any>;
}

const DEFAULT_TITLE = 'PHANTOM — Your Best Editions';
const DEFAULT_DESCRIPTION =
  'Archival apparel and considered leather goods, crafted in limited seasonal editions with historic European mills. Free two-year atelier repair promise.';
const DEFAULT_IMAGE = 'https://res.cloudinary.com/degearesj/image/upload/v1792102760/phantom/collections/uvdk8swcomi1dfpnzxsm.jpg';
const SITE_URL = 'https://phantom.oluwadamilare.xyz';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  schema
}: SEOProps) {
  const location = useLocation();
  const canonicalUrl = `${SITE_URL}${location.pathname}`;
  const fullTitle = title ? `${title} — PHANTOM` : DEFAULT_TITLE;

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // Helper to set or create a meta tag
    const setMetaTag = (selector: string, attribute: string, attrValue: string, content: string) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, attrValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // 2. Set Meta Descriptions
    setMetaTag('meta[name="description"]', 'name', 'description', description);

    // 3. Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);

    // 4. Twitter Tags
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    // 5. Canonical Link Tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // 6. Dynamic JSON-LD Schema (if provided)
    let schemaScript = document.getElementById('dynamic-json-ld');
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'dynamic-json-ld';
        schemaScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }

    return () => {
      // Cleanup dynamic schema when unmounting page
      const currentSchema = document.getElementById('dynamic-json-ld');
      if (currentSchema) currentSchema.remove();
    };
  }, [fullTitle, description, image, canonicalUrl, type, schema]);

  return null;
}
