export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NP Create",
    url: "https://npcreate.co.th",
    logo: "https://npcreate.co.th/og-image.png",
    description:
      "รับยิงแอด GMV Max และทำการตลาด TikTok Shop ดูแลมาแล้วมากกว่า 500 แบรนด์ ยอดขายรวมทะลุ 800 ล้านบาท",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "Thai",
      url: "https://app.npcreate.co.th/contact",
    },
    sameAs: ["https://line.me/R/ti/p/@npcreate"],
    areaServed: "TH",
    knowsAbout: ["TikTok Shop", "GMV Max", "Digital Marketing", "TikTok Advertising"],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function ServicesJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "Service",
        position: 1,
        name: "ยิงแอด GMV Max",
        description: "บริการยิงโฆษณา TikTok Shop ด้วย GMV Max เพิ่มยอดขาย ROI 8–15x",
        provider: { "@type": "Organization", name: "NP Create" },
        areaServed: "TH",
      },
      {
        "@type": "Service",
        position: 2,
        name: "วางกลยุทธ์ TikTok Shop",
        description: "วิเคราะห์คู่แข่ง วางแผน campaign และ KPI รายเดือน",
        provider: { "@type": "Organization", name: "NP Create" },
        areaServed: "TH",
      },
      {
        "@type": "Service",
        position: 3,
        name: "Content & Creative",
        description: "ผลิต creative สำหรับโฆษณา TikTok Shop พร้อม A/B testing",
        provider: { "@type": "Organization", name: "NP Create" },
        areaServed: "TH",
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
