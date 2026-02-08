import { Helmet } from "react-helmet-async";

interface PageSEOProps {
  title: string;
  description: string;
  ogImage?: string;
  path?: string;
}

const BASE_URL = "https://guardiantech.site";

const PageSEO = ({ title, description, ogImage = "/images/og-index.jpg", path = "" }: PageSEOProps) => {
  const fullTitle = title.includes("GuardianTech") ? title : `${title} | GuardianTech`;
  const url = `${BASE_URL}${path}`;
  const imageUrl = ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="GuardianTech" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default PageSEO;
