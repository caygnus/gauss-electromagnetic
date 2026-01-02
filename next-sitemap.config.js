/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl:
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://www.gausselectromagnetics.com",
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    exclude: ["/api/*", "/admin/*", "/_next/*", "/404", "/500"],
    robotsTxtOptions: {
        policies: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/api/", "/admin/", "/_next/"],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: ["/api/", "/admin/", "/_next/"],
            },
            {
                userAgent: "Bingbot",
                allow: "/",
                disallow: ["/api/", "/admin/", "/_next/"],
            },
            {
                userAgent: "Twitterbot",
                allow: "/",
            },
            {
                userAgent: "facebookexternalhit",
                allow: "/",
            },
        ],
        additionalSitemaps: [],
    },
    changefreq: "weekly",
    priority: 0.7,
    sitemapSize: 5000,
    transform: async (config, path) => {
        // Custom transform logic can be added here
        // For now, return default config
        return {
            loc: path,
            changefreq: config.changefreq,
            priority: config.priority,
            lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
        }
    },
}
