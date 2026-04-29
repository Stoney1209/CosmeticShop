interface StructuredDataProps {
  data: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}

// Helper functions for common structured data types
export function generateProductStructuredData({
  name,
  description,
  image,
  price,
  currency = "MXN",
  availability = "https://schema.org/InStock",
  sku,
  brand,
  category,
  url
}: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  availability?: string;
  sku: string;
  brand?: string;
  category?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name,
    description,
    image,
    sku,
    brand: brand ? {
      "@type": "Brand",
      name: brand
    } : undefined,
    category,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price: price.toString(),
      availability,
      seller: {
        "@type": "Organization",
        name: "Cosmetics Shop"
      }
    }
  };
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item
    }))
  };
}

export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cosmetics Shop",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://cosmeticsshop.com",
    logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://cosmeticsshop.com"}/logo.png`,
    description: "Tienda de cosméticos y productos de belleza",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+52-921-123-4567",
      contactType: "customer service"
    }
  };
}

export function generateWebSiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cosmetics Shop",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://cosmeticsshop.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || "https://cosmeticsshop.com"}/tienda?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}
