import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  poster?: string;
  slug?: string;
  episodeNumber?: number;
  type?: 'website' | 'video.movie' | 'video.episode';
  schema?: Record<string, any>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'PHIM HAY 247 - Xem Phim Tuyển Chọn Mới Nhất',
  description = 'PHIM HAY 247 - Website xem phim tuyển chọn, tổng hợp các bộ phim kiếm hiệp, cổ trang, ngôn tình phát trực tiếp từ YouTube.',
  keywords = 'phim hay, phim moi, xem phim 247, phim kiem hiep, phim youtube',
  poster = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80',
  slug = '',
  episodeNumber,
  type = 'website',
  schema,
}) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://phimhay247.vn';
  const canonicalUrl = slug
    ? `${siteUrl}/phim/${slug}${episodeNumber ? `/tap-${episodeNumber}` : ''}`
    : siteUrl;

  const fullTitle = title.includes('PHIM HAY 247') ? title : `${title} | PHIM HAY 247`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content="PHIM HAY 247" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={poster} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={poster} />

      {/* Schema.org Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
