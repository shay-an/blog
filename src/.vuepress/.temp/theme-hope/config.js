import { defineClientConfig } from "@vuepress/client";
import { VPLink } from "/Users/a1/temp/hope-project/node_modules/.pnpm/registry.npmjs.org+vuepress-shared@2.0.0-beta.233_vuepress@2.0.0-beta.66/node_modules/vuepress-shared/lib/client/index.js";

import { HopeIcon, Layout, NotFound, useScrollPromise, injectDarkmode, setupDarkmode, setupSidebarItems } from "/Users/a1/temp/hope-project/node_modules/.pnpm/registry.npmjs.org+vuepress-theme-hope@2.0.0-beta.233_vuepress@2.0.0-beta.66/node_modules/vuepress-theme-hope/lib/bundle/export.js";

import { defineAutoCatalogIconComponent } from "/Users/a1/temp/hope-project/node_modules/.pnpm/registry.npmjs.org+vuepress-plugin-auto-catalog@2.0.0-beta.233_vuepress@2.0.0-beta.66/node_modules/vuepress-plugin-auto-catalog/lib/client/index.js"
import { BlogCategory, BlogHome, BlogType, BloggerInfo, Timeline, setupBlog } from "/Users/a1/temp/hope-project/node_modules/.pnpm/registry.npmjs.org+vuepress-theme-hope@2.0.0-beta.233_vuepress@2.0.0-beta.66/node_modules/vuepress-theme-hope/lib/bundle/modules/blog/export.js";
import "/Users/a1/temp/hope-project/node_modules/.pnpm/registry.npmjs.org+vuepress-theme-hope@2.0.0-beta.233_vuepress@2.0.0-beta.66/node_modules/vuepress-theme-hope/lib/bundle/modules/blog/styles/all.scss";
import { GlobalEncrypt, LocalEncrypt } from "/Users/a1/temp/hope-project/node_modules/.pnpm/registry.npmjs.org+vuepress-theme-hope@2.0.0-beta.233_vuepress@2.0.0-beta.66/node_modules/vuepress-theme-hope/lib/bundle/modules/encrypt/export.js";
import "/Users/a1/temp/hope-project/node_modules/.pnpm/registry.npmjs.org+vuepress-theme-hope@2.0.0-beta.233_vuepress@2.0.0-beta.66/node_modules/vuepress-theme-hope/lib/bundle/modules/encrypt/styles/all.scss"
import Slide from "/Users/a1/temp/hope-project/node_modules/.pnpm/registry.npmjs.org+vuepress-plugin-md-enhance@2.0.0-beta.233_vuepress@2.0.0-beta.66/node_modules/vuepress-plugin-md-enhance/lib/client/SlidePage.js";

import "/Users/a1/temp/hope-project/node_modules/.pnpm/registry.npmjs.org+vuepress-theme-hope@2.0.0-beta.233_vuepress@2.0.0-beta.66/node_modules/vuepress-theme-hope/lib/bundle/styles/all.scss";

defineAutoCatalogIconComponent(HopeIcon);

export default defineClientConfig({
  enhance: ({ app, router }) => {
    const { scrollBehavior } = router.options;

    router.options.scrollBehavior = async (...args) => {
      await useScrollPromise().wait();

      return scrollBehavior(...args);
    };

    // inject global properties
    injectDarkmode(app);

    // provide HopeIcon as global component
    app.component("HopeIcon", HopeIcon);
    // provide VPLink as global component
    app.component("VPLink", VPLink);

    app.component("BloggerInfo", BloggerInfo);
    app.component("GlobalEncrypt", GlobalEncrypt);
    app.component("LocalEncrypt", LocalEncrypt);
  },
  setup: () => {
    setupDarkmode();
    setupSidebarItems();
    setupBlog();
  },
  layouts: {
    Layout,
    NotFound,
    BlogCategory,
    BlogHome,
    BlogType,
    Timeline,
    Slide,
  }
});