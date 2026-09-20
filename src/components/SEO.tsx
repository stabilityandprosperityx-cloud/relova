import { Helmet } from "react-helmet-async";

const SITE_ORIGIN = "https://relova.ai";

export type SEOProps = {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  /** One or more JSON-LD objects (e.g. BreadcrumbList) to emit as <script type="application/ld+json">. */
  jsonLd?: object | object[];
};

function resolveOgImage(ogImage?: string) {
  const path = (ogImage?.trim() || "/favicon.png").trim();
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${p}`;
}

export default function SEO({ title, description, ogImage, canonical, jsonLd }: SEOProps) {
  const image = resolveOgImage(ogImage);
  const jsonLdList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <title>{title}</title>
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLdList.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Helmet>
  );
}
