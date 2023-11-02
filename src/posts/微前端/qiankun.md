---
title: qiankun 微前端架构
cover: /assets/images/cover2.jpg
icon: pen-to-square
date: 2023-07-28
category:
  - qiankun
tag:
  - qiankun
  - 微前端
  - 架构
star: true
sticky: true
---

### 基座

package.json

```json
{
  "name": "micro-base",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    // 通过 customize-cra 扩展 create-react-app webpack 配置
    "customize-cra": "^1.0.0",
    "react-app-rewired": "^2.2.1",
    // 引入 qiankun 
    "qiankun": "^2.8.4",
    //...
  },
  "scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test",
    "eject": "react-app-rewired eject"
  }
}

```

src/index.tsx
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'
import './index.css';
import App from './App';
import { start, registerMicroApps, initGlobalState } from 'qiankun'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// 1. 要加载的子应用列表
const apps = [
  {
    name: "sub-react", // 子应用的名称
    entry: '//localhost:3001', // 默认会加载这个路径下的html，解析里面的js
    activeRule: "/sub-react", // 匹配的路由
    container: "#sub-app" // 加载的容器
  },
  {
    name: "sub-vue", // 子应用的名称
    entry: '//localhost:3002', // 默认会加载这个路径下的html，解析里面的js
    activeRule: "/sub-vue", // 匹配的路由
    container: "#sub-app" // 加载的容器
  },
  {
    name: "sub-umi", // 子应用的名称
    entry: '//localhost:3003', // 默认会加载这个路径下的html，解析里面的js
    activeRule: "/sub-umi", // 匹配的路由
    container: "#sub-app" // 加载的容器
  }
]

// 2. 注册子应用
registerMicroApps(apps, {
  beforeLoad: [async app => console.log('before load', app.name)],
  beforeMount: [async app => console.log('before mount', app.name)],
  afterMount: [async app => console.log('after mount', app.name)],
})

const state = { count: 1 }

const actions = initGlobalState(state);
// 主项目项目监听和修改
actions.onGlobalStateChange((state, prev) => {
  // state: 变更后的状态; prev 变更前的状态
  console.log(state, prev);
});
actions.setGlobalState(state);

start() // 3. 启动微服务
```

src/routes.ts
```typescript
import Home from "./pages/Home";

const routes = [
  {
    path: "/",
    key: 'main-app',
    component: Home,
    title: '首页',
    showMenu: true, // 是否在菜单中显示
  },
  {
    path: "/sub-react",
    key: 'sub-react',
    title: 'react子应用',
    showMenu: true,
  },
  {
    path: "/sub-vue",
    key: 'sub-vue',
    title: 'vue子应用',
    showMenu: true,
  },
  {
    path: "/sub-umi",
    key: 'sub-umi',
    title: 'umi子应用',
    showMenu: true,
  }
];

export default routes;
```

src/App.tsx

```tsx
import { useState } from 'react';
import './App.css';
import { Layout, Menu } from 'antd';
import { Link, Routes, Route } from 'react-router-dom';
import routes from './routes';
import Home from './pages/Home';

const { Sider, Header, Content } = Layout;

function App() {
  const currentPath = window.location.pathname;
  
  const [selectedPath, setSelectedPath] = useState(
    routes.find(item => currentPath.includes(item.key))?.key || ''
  );

  // 重写函数
  const _wr = function (type: string) {
    const orig = (window as any).history[type]
    return function () {
      const rv = orig.apply(this, arguments)
      const e: any = new Event(type)
      e.arguments = arguments
      window.dispatchEvent(e)
      return rv
    }
  }

  window.history.pushState = _wr('pushState')

  // 在这个函数中做跳转后的逻辑
  const bindHistory = () => {
    const currentPath = window.location.pathname;
    setSelectedPath(
      routes.find(item => currentPath.includes(item.key))?.key || ''
    )
  }

  // 绑定事件
  window.addEventListener('pushState', bindHistory)

  return (
    <Layout>
      <Sider collapsedWidth="0">
        <img src="https://www.itheima.com/images/logo.png" className='page-logo' alt="" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['main-app']}
          selectedKeys={[selectedPath || 'main-app']}
          onClick={({ key }) => setSelectedPath(key)}
        >
          {
            routes.filter((item) => item.showMenu).map(route => {
              return (
                <Menu.Item key={route.key}>
                  <Link to={route.path}>
                    {route.title}
                  </Link>
                </Menu.Item>
              );
            })
          }
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: 0 }} />
        <Content style={{ margin: '24px 16px 0', height: '100%', background: '#fff', padding: '24px' }}>
          {/* 主应用渲染区域 */}
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>

          {/* 子应用渲染区域 */}
          <div id='sub-app'></div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;

```

提取公共依赖库 config-overrides.js

```javascript
// 修改config-overrides.js
const { override, addWebpackExternals } = require('customize-cra')

module.exports = override(
  addWebpackExternals({
    axios: "axios",
  }),
)
```

### React 子应用

config-overrides.js

> 同上扩展 webpack 配置，将项目打包成 umd 模块

```javascript
// 在根目录下新增config-overrides.js文件并新增如下配置
const { name } = require("./package");

module.exports = {
  webpack: (config) => {
    config.output.library = `${name}-[name]`;
    config.output.libraryTarget = "umd";
    config.output.chunkLoadingGlobal = `webpackJsonp_${name}`;
    return config;
  }
};
```
src/index.tsx

以下演示了如何注册应用
```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom'
import './public-path.js'

let root: any;
function render(props: any) {
  const { container } = props
  const dom = container ? container.querySelector('#root') : document.getElementById('root')
  root = createRoot(dom)
  root.render(
    <BrowserRouter basename='/sub-react'>
      <App/>
    </BrowserRouter>
  )
}

// 判断是否在qiankun环境下，非qiankun环境下独立运行
if (!(window as any).__POWERED_BY_QIANKUN__) {
  render({});
}

// 各个生命周期
// bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
export async function bootstrap() {
  console.log('react app bootstraped');
}

// 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
export async function mount(props: any) {
  console.log(props)
  props.onGlobalStateChange((state, prev) => {
    // state: 变更后的状态; prev 变更前的状态
    console.log(state, prev);
    // 将这个state存储到我们子应用store
  });
  props.setGlobalState({ count: 2 });
  render(props);
}

// 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
export async function unmount(props: any) {
  root.unmount();
}
```

src/App.tsx

以下演示了不同应用的跳转
```tsx
import './App.css';
import { Link, Routes, Route } from 'react-router-dom'
import List from './pages/List';
import Detail from './pages/Detail';

function App() {

  const goVue = () => {
    window.history.pushState({}, '', '/sub-vue')
  }

  return (
    <div className="App">
      <h2>react 子应用</h2>
      <div className='menu'>
        <Link to={'/'}>list</Link>
        <Link to={'/detail'}>detail</Link>
        <a onClick={goVue}>vue列表页</a>
      </div>
      <Routes>
        <Route path='/' element={<List />} />
        <Route path='/detail' element={<Detail />} />
      </Routes>
    </div>
  );
}

export default App;

```

### umi-app 子应用

package.json

```json
{
  "name": "umi-app",
  "private": true,
  "author": "lvjiaqi <lvjiaqi@itcast.cn>",
  "scripts": {
    "dev": "umi dev",
    "build": "umi build",
    "postinstall": "umi setup",
    "setup": "umi setup",
    "start": "npm run dev"
  },
  "dependencies": {
    "@umijs/plugins": "^4.0.28",
    "axios": "^1.1.3",
    "umi": "^4.0.28"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^4.1.2"
  }
}

```

.umirc.ts

这里同样要配置成 umd 模块

```typescript
export default {
  base: '/sub-umi',
  npmClient: 'npm',
  plugins: ['@umijs/plugins/dist/qiankun'],
  qiankun: {
    slave: {},
  },
  // 引入公共依赖库的方式，这里使用了 cdn 方式引入
  headScripts: [
    { src: 'https://unpkg.com/axios@1.1.2/dist/axios.min.js', ignore: true },
  ],
};

```

src/app.ts

进行应用的注册

```typescript
export const qiankun = {
  async mount(props: any) {
    console.log(props)
  },
  async bootstrap() {
    console.log('umi app bootstraped');
  },
  async afterMount(props: any) {
    console.log('umi app afterMount', props);
  },
};
```

src/index.tsx

以下演示使用公共依赖库

```tsx
import axios from 'axios';
import { useEffect } from 'react'

export default function List() {
  useEffect(() => {
    axios.get('/list').then(res => {
      console.log(res);
    })
  }, [])
  return (
    <div>
      列表页内容
    </div>
  );
}

```

### Vue 子应用

vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  base: '/sub-vue', // 和基座中配置的activeRule一致
  server: {
    port: 3002,
    cors: true,
    origin: 'http://localhost:3002'
  },
  plugins: [
    vue(),
    qiankun('sub-vue', { // 配置qiankun插件
      useDevMode: true
    })
  ]
})

```

src/main.ts

应用注册

```typescript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import router from './router'
let app: any;
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  createApp(App).use(router).mount('#app');
} else {
  renderWithQiankun({
    mount(props) {
      app = createApp(App);
      app.use(router).mount(props.container.querySelector('#app'));
    },
    bootstrap() {
      console.log('vue app bootstrap');
    },
    update() {
      console.log('vue app update');
    },
    unmount() {
      console.log('vue app unmount');
      app?.unmount();
    }
  });
}
```

### 总结

以上演示了 qiankun 微前端框架的使用流程的关键代码，qiankun 实现了应用注册，样式隔离，预加载，生命周期，js css 隔离，公共依赖加载，父子通讯，应用嵌套。

从而可以实现多团队并行开发，大大减少了沟通成本，在应用划分时需要考虑应用与应用之间是否频繁通讯，如果频繁通讯说明业务上耦合，则建议合并为一个应用。