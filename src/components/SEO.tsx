import { Helmet } from "react-helmet-async";

const SITE_ORIGIN = "https://relova.ai";

export type SEOProps = {
  title: string;
  description: string;
  ogImage?: string;
};

function resolveOgImage(ogImage?: string) {
  const path = (ogImage?.trim() || "/favicon.png").trim();
  if (/^https?:\/\//i.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${p}`;
}

export default function SEO({ title, description, ogImage }: SEOProps) {
  const image = resolveOgImage(ogImage);
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
