import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "Shay An",
  description: "web前端/Node.js/Cocos",

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
