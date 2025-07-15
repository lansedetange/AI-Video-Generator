// content-collections.ts
import path from "path";

// src/config/website.tsx
var websiteConfig = {
  metadata: {
    theme: {
      defaultTheme: "default",
      enableSwitch: true
    },
    mode: {
      defaultMode: "system",
      enableSwitch: true
    },
    images: {
      ogImage: "/og.png",
      logoLight: "/logo.png",
      logoDark: "/logo-dark.png"
    },
    social: {
      github: "https://github.com/MkSaaSHQ",
      twitter: "https://mksaas.link/twitter",
      blueSky: "https://mksaas.link/bsky",
      discord: "https://mksaas.link/discord",
      mastodon: "https://mksaas.link/mastodon",
      linkedin: "https://mksaas.link/linkedin",
      youtube: "https://mksaas.link/youtube"
    }
  },
  features: {
    enableDiscordWidget: false,
    enableUpgradeCard: true,
    enableAffonsoAffiliate: false,
    enablePromotekitAffiliate: false
  },
  routes: {
    defaultLoginRedirect: "/dashboard"
  },
  analytics: {
    enableVercelAnalytics: false,
    enableSpeedInsights: false
  },
  auth: {
    enableGoogleLogin: true,
    enableGithubLogin: true
  },
  i18n: {
    defaultLocale: "en",
    locales: {
      en: {
        flag: "\u{1F1FA}\u{1F1F8}",
        name: "English"
      },
      zh: {
        flag: "\u{1F1E8}\u{1F1F3}",
        name: "\u4E2D\u6587"
      }
    }
  },
  blog: {
    paginationSize: 6,
    relatedPostsSize: 3
  },
  mail: {
    provider: "resend",
    // Email provider to use
    supportEmail: "contact@example.com"
    // Default sender and recipient email address
  },
  newsletter: {
    provider: "resend",
    // Newsletter provider to use
    autoSubscribeAfterSignUp: false
    // Whether to automatically subscribe users after sign up
  },
  storage: {
    provider: "s3"
  },
  payment: {
    provider: "stripe"
  },
  price: {
    plans: {
      free: {
        id: "free",
        prices: [],
        isFree: true,
        isLifetime: false
      },
      pro: {
        id: "pro",
        prices: [
          {
            type: "subscription" /* SUBSCRIPTION */,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
            amount: 990,
            currency: "USD",
            interval: "month" /* MONTH */
          },
          {
            type: "subscription" /* SUBSCRIPTION */,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
            amount: 9900,
            currency: "USD",
            interval: "year" /* YEAR */
          }
        ],
        isFree: false,
        isLifetime: false,
        recommended: true
      },
      lifetime: {
        id: "lifetime",
        prices: [
          {
            type: "one_time" /* ONE_TIME */,
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME,
            amount: 19900,
            currency: "USD"
          }
        ],
        isFree: false,
        isLifetime: true
      }
    }
  }
};

// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";
var DEFAULT_LOCALE = websiteConfig.i18n.defaultLocale;
var LOCALES = Object.keys(websiteConfig.i18n.locales);
var LOCALE_COOKIE_NAME = "NEXT_LOCALE";
var routing = defineRouting({
  // A list of all locales that are supported
  locales: LOCALES,
  // Default locale when no locale matches
  defaultLocale: DEFAULT_LOCALE,
  // Auto detect locale
  // https://next-intl.dev/docs/routing/middleware#locale-detection
  localeDetection: false,
  // Once a locale is detected, it will be remembered for
  // future requests by being stored in the NEXT_LOCALE cookie.
  localeCookie: {
    name: LOCALE_COOKIE_NAME
  },
  // The prefix to use for the locale in the URL
  // https://next-intl.dev/docs/routing#locale-prefix
  localePrefix: "as-needed"
});

// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import {
  createDocSchema,
  createMetaSchema,
  transformMDX
} from "@fumadocs/content-collections/configuration";
var docs = defineCollection({
  name: "docs",
  directory: "content/docs",
  include: "**/*.mdx",
  schema: (z) => ({
    ...createDocSchema(z),
    preview: z.string().optional(),
    index: z.boolean().default(false)
  }),
  transform: transformMDX
});
var metas = defineCollection({
  name: "meta",
  directory: "content/docs",
  include: "**/meta**.json",
  parser: "json",
  schema: createMetaSchema
});
var authors = defineCollection({
  name: "author",
  directory: "content/author",
  include: "**/*.mdx",
  schema: (z) => ({
    slug: z.string(),
    name: z.string(),
    avatar: z.string(),
    locale: z.string().optional().default(DEFAULT_LOCALE)
  }),
  transform: async (data, context) => {
    const filePath = data._meta.path;
    const fileName = filePath.split(path.sep).pop() || "";
    const { locale, base } = extractLocaleAndBase(fileName);
    return {
      ...data,
      locale
    };
  }
});
var categories = defineCollection({
  name: "category",
  directory: "content/category",
  include: "**/*.mdx",
  schema: (z) => ({
    slug: z.string(),
    name: z.string(),
    description: z.string(),
    locale: z.string().optional().default(DEFAULT_LOCALE)
  }),
  transform: async (data, context) => {
    const filePath = data._meta.path;
    const fileName = filePath.split(path.sep).pop() || "";
    const { locale, base } = extractLocaleAndBase(fileName);
    return {
      ...data,
      locale
    };
  }
});
var posts = defineCollection({
  name: "post",
  directory: "content/blog",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    date: z.string().datetime(),
    published: z.boolean().default(true),
    categories: z.array(z.string()),
    author: z.string(),
    estimatedTime: z.number().optional()
    // Reading time in minutes
  }),
  transform: async (data, context) => {
    const transformedData = await transformMDX(data, context);
    const filePath = data._meta.path;
    const fileName = filePath.split(path.sep).pop() || "";
    const { locale, base } = extractLocaleAndBase(fileName);
    const blogAuthor = context.documents(authors).find((a) => a.slug === data.author && a.locale === locale);
    const blogCategories = data.categories.map((categorySlug) => {
      const category = context.documents(categories).find((c) => c.slug === categorySlug && c.locale === locale);
      return category;
    }).filter(Boolean);
    const slug = `/blog/${base}`;
    const slugAsParams = base;
    const wordCount = data.content.split(/\s+/).length;
    const wordsPerMinute = 200;
    const estimatedTime = Math.max(Math.ceil(wordCount / wordsPerMinute), 1);
    return {
      ...data,
      locale,
      author: blogAuthor,
      categories: blogCategories,
      slug,
      slugAsParams,
      estimatedTime,
      body: transformedData.body,
      toc: transformedData.toc
    };
  }
});
var pages = defineCollection({
  name: "page",
  directory: "content/pages",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    date: z.string().datetime(),
    published: z.boolean().default(true)
  }),
  transform: async (data, context) => {
    const transformedData = await transformMDX(data, context);
    const filePath = data._meta.path;
    const fileName = filePath.split(path.sep).pop() || "";
    const { locale, base } = extractLocaleAndBase(fileName);
    const slug = `/pages/${base}`;
    const slugAsParams = base;
    return {
      ...data,
      locale,
      slug,
      slugAsParams,
      body: transformedData.body,
      toc: transformedData.toc
    };
  }
});
var releases = defineCollection({
  name: "release",
  directory: "content/release",
  include: "**/*.mdx",
  schema: (z) => ({
    title: z.string(),
    description: z.string(),
    date: z.string().datetime(),
    version: z.string(),
    published: z.boolean().default(true)
  }),
  transform: async (data, context) => {
    const transformedData = await transformMDX(data, context);
    const filePath = data._meta.path;
    const fileName = filePath.split(path.sep).pop() || "";
    const { locale, base } = extractLocaleAndBase(fileName);
    const slug = `/release/${base}`;
    const slugAsParams = base;
    return {
      ...data,
      locale,
      slug,
      slugAsParams,
      body: transformedData.body,
      toc: transformedData.toc
    };
  }
});
function extractLocaleAndBase(fileName) {
  const parts = fileName.split(".");
  if (parts.length === 1) {
    return { locale: DEFAULT_LOCALE, base: parts[0] };
  }
  if (parts.length === 2 && LOCALES.includes(parts[1])) {
    return { locale: parts[1], base: parts[0] };
  }
  console.warn(`Unexpected filename format: ${fileName}`);
  return { locale: DEFAULT_LOCALE, base: parts[0] };
}
var content_collections_default = defineConfig({
  collections: [docs, metas, authors, categories, posts, pages, releases]
});
export {
  authors,
  categories,
  content_collections_default as default,
  pages,
  posts,
  releases
};
