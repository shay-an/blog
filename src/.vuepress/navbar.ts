import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "博文",
    icon: "pen-to-square",
    prefix: "/posts/",
    children: [
      {
        text: "Vue",
        icon: "pen-to-square",
        prefix: "vue/",
        children: [
          "vue-cli-4-up-5",
        ],
      }
    ],
  },
]);
