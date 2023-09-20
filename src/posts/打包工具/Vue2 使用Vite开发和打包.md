---
title: Vue2 使用Vite开发和打包
cover: /assets/images/cover2.jpg
icon: pen-to-square
date: 2022-01-21
category:
  - Vue2 使用Vite开发和打包
tag:
  - vite
  - vue
  - vue2
star: false
sticky: false
---

首先根目录下要有index.html，也就是项目的入口文件

在页面中添加以下代码：用于引入Vue初始化入口文件
```html
<script type="module" src="/src/main.ts"></script>
```

关键vite插件：vite-plugin-vue2 @rollup/plugin-babel

新建：vite.config.js

```javascript
import {defineConfig} from 'vite'
import {createVuePlugin} from 'vite-plugin-vue2'
import {resolve} from 'path'
import babel from "@rollup/plugin-babel"
//兼容IE插件，兼容IE有额外代码支持体积会增大
import legacy from '@vitejs/plugin-legacy'
function pathResolve(dir) {
  return resolve(process.cwd(), '.', dir)
}
// vite.config.js
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port:'5000',
    proxy: {//配置代理接口，用于解决跨域导致接口访问不到的问题
    '/boss': {
        target: 'http://eduboss.lagou.com/',
        changeOrigin: true,
    },
    '/front': {
        target: 'http://edufront.lagou.com/',
        changeOrigin: true,
    }
    }
  },
  plugins: [
    createVuePlugin({
      vueTemplateOptions: {}
    }),
    legacy({//兼容IE配置
        targets: ['> 1%, last 1 version, ie >= 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'], // 面向IE11时需要此插件
    }),
  ],
  resolve: {
    extensions: ['.vue', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    alias: {
      // vue2项目别名一般都是@，vue3中一般使用/@/, 为方便使用
      '@': resolve('src')
    }
  },
  esbuild:{
      loader:'tsx'
  }
})
```

这里只是一个开始，只是验证了方案的可行性

参考文献 https://juejin.cn/post/6973928601523585055
