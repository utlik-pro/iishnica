import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: "website" | "article";
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  siteName?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  image,
  url,
  type = "website",
  publishedAt,
  modifiedAt,
  author,
  siteName = "M.AI.N - AI Community",
}) => {
  const fullTitle = `${title} | ${siteName}`;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://iishnica.utlik.co";
  const defaultImage = `${baseUrl}/og-image.png`;

  // Ensure image URL is absolute
  const getAbsoluteUrl = (imgUrl: string | undefined): string => {
    if (!imgUrl) return defaultImage;
    if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
      return imgUrl;
    }
    return `${baseUrl}${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`;
  };

  const ogImage = getAbsoluteUrl(image);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="ru_RU" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Article specific (for blog posts) */}
      {type === "article" && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {type === "article" && modifiedAt && (
        <meta property="article:modified_time" content={modifiedAt} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEOHead;
