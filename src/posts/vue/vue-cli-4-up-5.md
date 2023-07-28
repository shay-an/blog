---
title: vue-cli 4.x项目升级 5.x
cover: /assets/images/cover2.jpg
icon: pen-to-square
date: 2023-07-28
category:
  - vue
tag:
  - vue-cli
  - webpack
star: true
sticky: true
---

### 步骤：
1. 升级cli 相关包版本

```javascript
-    "@vue/cli-plugin-babel": "^4.5.15",
-    "@vue/cli-plugin-eslint": "^4.5.15",
-    "@vue/cli-service": "^4.5.15",
+    "@vue/cli-plugin-babel": "^5.0.8",
+    "@vue/cli-plugin-eslint": "^5.0.8",
+    "@vue/cli-service": "^5.0.8",
+    "node-polyfill-webpack-plugin": "^2.0.1",//升级后在js内使用node模块需要安装polyfill

```
2. 修改vue.config.js 配置文件

devServer.overlay 将webpack报错显示到页面中的配置移动到了 devServer.client下面

devServer.proxy 配置：
```javascript
// 4.x 
api :{
    target: BASE_URL,
    ws: true,
    changeOrigin: true,
}
// 5.x
'/api' :{
    target: BASE_URL,
    ws: true,
    changeOrigin: true,
}
```

plugins

```javascript
      plugins: [
        new Webpack.ProvidePlugin(providePlugin),
+       new NodePolyfillPlugin(),
        new WebpackBar({
          name: webpackBarName,
        }),

```
css 这里需以模块引入的css 将文件名 xxx.css 改为 xxx.module.css，然后删除下面选项

```javascript
-    requireModuleExtension: true,

```

JSON引入需按 default 引入

