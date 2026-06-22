import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type StructuredData = Record<string, unknown>;
type FaqEntry = { question: string; answer: string };
type ServiceEntry = {
  name: string;
  description: string;
  category?: string;
};

interface SeoProps {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  structuredData?: StructuredData | StructuredData[];
}

export const SITE_NAME = "Casa Bonita Centro Estetico";
export const DEFAULT_KEYWORDS = [
  "spa",
  "centro estetico",
  "belleza",
  "tratamientos faciales",
  "tratamientos corporales",
  "cuidado de la piel",
  "depilacion",
  "masajes",
  "cosmetologia",
  "Casa Bonita",
  "Caldas Antioquia",
];

const SOCIAL_LINKS = [
  "https://www.instagram.com/casabonitacentroestetico/",
  "https://www.facebook.com/casabonitacentroestetico/",
];

const PHONE_NUMBER = "+57 321 757 1992";
const CONTACT_EMAIL = "casabonitacentroestetico@gmail.com";

const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_SITE_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  return "";
};

const toAbsoluteUrl = (value: string) => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${getBaseUrl()}${value.startsWith("/") ? value : `/${value}`}`;
};

const setMetaTag = (
  selector: string,
  attribute: "name" | "property",
  key: string,
  content: string,
) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
};

const setLinkTag = (rel: string, href: string) => {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", href);
};

const loadGoogleAnalytics = (trackingId: string) => {
  if (document.getElementById("cb-ga-script")) {
    return;
  }

  const gaScript = document.createElement("script");
  gaScript.id = "cb-ga-script";
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  document.head.appendChild(gaScript);

  const inlineScript = document.createElement("script");
  inlineScript.id = "cb-ga-inline";
  inlineScript.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${trackingId}', { send_page_view: false });
  `;
  document.head.appendChild(inlineScript);
};

export const buildLocalBusinessSchema = (): StructuredData => {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: SITE_NAME,
    description:
      "Centro estetico de belleza en Caldas, Antioquia, especializado en tratamientos faciales, corporales, depilacion, cuidado de la piel y bienestar integral.",
    url: baseUrl || undefined,
    image: baseUrl ? `${baseUrl}/casabonita-logo.png` : undefined,
    logo: baseUrl ? `${baseUrl}/casabonita-logo.png` : undefined,
    telephone: PHONE_NUMBER,
    email: CONTACT_EMAIL,
    priceRange: "$$",
    sameAs: SOCIAL_LINKS,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Caldas",
      addressRegion: "Antioquia",
      addressCountry: "CO",
    },
    areaServed: [
      {
        "@type": "City",
        name: "Caldas",
      },
      {
        "@type": "AdministrativeArea",
        name: "Antioquia",
      },
    ],
    knowsAbout: [
      "Tratamientos faciales",
      "Tratamientos corporales",
      "Depilacion",
      "Cuidado de la piel",
      "Belleza integral",
      "Bienestar",
    ],
  };
};

export const buildBreadcrumbSchema = (
  items: Array<{ name: string; path: string }>,
): StructuredData => {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: baseUrl ? `${baseUrl}${item.path}` : item.path,
    })),
  };
};

export const buildFaqSchema = (items: FaqEntry[]): StructuredData => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

export const buildServiceSchema = (items: ServiceEntry[]): StructuredData => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      name: item.name,
      description: item.description,
      serviceType: item.category || item.name,
      provider: {
        "@type": "BeautySalon",
        name: SITE_NAME,
      },
      areaServed: {
        "@type": "City",
        name: "Caldas, Antioquia",
      },
    },
  })),
});

const Seo = ({
  title,
  description,
  keywords = DEFAULT_KEYWORDS,
  path,
  image = "/casabonita-logo.png",
  type = "website",
  noindex = false,
  structuredData,
}: SeoProps) => {
  const location = useLocation();

  useEffect(() => {
    const baseUrl = getBaseUrl();
    const resolvedPath = path || `${location.pathname}${location.search}`;
    const canonicalUrl = baseUrl ? `${baseUrl}${resolvedPath}` : resolvedPath;
    const imageUrl = toAbsoluteUrl(image);
    const pageTitle = `${title} | ${SITE_NAME}`;
    const robotsValue = noindex ? "noindex, nofollow" : "index, follow";
    const mergedStructuredData = [
      buildLocalBusinessSchema(),
      ...(structuredData
        ? Array.isArray(structuredData)
          ? structuredData
          : [structuredData]
        : []),
    ];

    document.title = pageTitle;

    setMetaTag('meta[name="description"]', "name", "description", description);
    setMetaTag(
      'meta[name="keywords"]',
      "name",
      "keywords",
      keywords.join(", "),
    );
    setMetaTag('meta[name="robots"]', "name", "robots", robotsValue);

    setMetaTag('meta[property="og:type"]', "property", "og:type", type);
    setMetaTag('meta[property="og:title"]', "property", "og:title", pageTitle);
    setMetaTag(
      'meta[property="og:description"]',
      "property",
      "og:description",
      description,
    );
    setMetaTag('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMetaTag('meta[property="og:image"]', "property", "og:image", imageUrl);
    setMetaTag(
      'meta[property="og:site_name"]',
      "property",
      "og:site_name",
      SITE_NAME,
    );
    setMetaTag('meta[property="og:locale"]', "property", "og:locale", "es_CO");

    setMetaTag(
      'meta[name="twitter:card"]',
      "name",
      "twitter:card",
      "summary_large_image",
    );
    setMetaTag(
      'meta[name="twitter:title"]',
      "name",
      "twitter:title",
      pageTitle,
    );
    setMetaTag(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description",
      description,
    );
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", imageUrl);

    setLinkTag("canonical", canonicalUrl);

    const schemaScriptId = "cb-seo-jsonld";
    let scriptTag = document.getElementById(
      schemaScriptId,
    ) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = schemaScriptId;
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(mergedStructuredData);

    const trackingId = process.env.REACT_APP_GA_MEASUREMENT_ID?.trim();
    if (trackingId) {
      loadGoogleAnalytics(trackingId);
      if (window.gtag) {
        window.gtag("config", trackingId, {
          page_title: pageTitle,
          page_path: resolvedPath,
          page_location: canonicalUrl,
        });
      }
    }
  }, [
    description,
    image,
    keywords,
    location.pathname,
    location.search,
    noindex,
    path,
    structuredData,
    title,
    type,
  ]);

  return null;
};

export default Seo;
