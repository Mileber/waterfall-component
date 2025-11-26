# zyt-waterfall

一个支持横向和纵向布局的瀑布流公共组件，同时提供 Vue2 与 Vue3 两个版本。

## 功能特性

- 横向（Justified）与纵向（Masonry）两种布局
- 虚拟滚动，仅渲染视窗附近元素
- 图片尺寸缓存与懒加载支持
- 自定义插槽渲染内容
- 可配置参数（`rowHeight`/`columnWidth`、`gutter`、`maxItems` 等）
- 自动加载更多（`IntersectionObserver` 或滚动兜底）
- 事件：`render-start`/`render-end`/`resize`/`error`/`load-more`

## 安装与使用

### Vue2

```js
import Vue from 'vue'
import WaterfallComponent from 'waterfall-component-vue2'
Vue.component('WaterfallComponent', WaterfallComponent)
```

```html
<waterfall-component :items="items" direction="horizontal" :row-height="180" :gutter="12">
  <template v-slot="{ item }">
    <img :src="item.cover" />
  </template>
</waterfall-component>
```

### Vue3

```ts
import { createApp } from 'vue'
import WaterfallComponent from 'waterfall-component-vue3'
createApp(App).component('WaterfallComponent', WaterfallComponent)
```

```html
<waterfall-component
  :items="items"
  direction="horizontal"
  :row-height="180"
  :gutter="12"
  :min-row-fill-ratio="0.8"
  align-last-row="center"
  :buffer-factor="2"
  :max-image-concurrency="4"
  @render-start="onRenderStart"
  @render-end="onRenderEnd"
  @resize="onResize"
  @error="onItemError"
  @load-more="loadMore"
>
  <template #default="{ item }">
    <img :src="item.cover" :alt="item.title || ''" />
  </template>
</waterfall-component>
```

#### 浏览器直接引入（无需打包）

示例通过 Import Map 方式映射 `vue` 并从 `dist` 引入组件 ESM 文件：

```html
<script type="importmap">{ "imports": { "vue": "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js" } }</script>
<script type="module">
  import { createApp } from 'vue'
  import WaterfallComponent from './vue3/dist/index.esm.js'
  createApp({ components: { WaterfallComponent } }).mount('#app')
</script>
```

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| items | Array | [] | 数据源（包含图片地址或尺寸） |
| direction | String | 'horizontal' | 布局方向(horizontal/vertical) |
| rowHeight | Number | 200 | 横向布局行高 |
| columnWidth | Number | 200 | 纵向布局列宽 |
| gutter | Number | 12 | 间距 |
| maxItems | Number | 0 | 横向每行最大数量（0表示无限制） |
| autoLoad | Boolean | true | 是否自动加载更多 |
| hasMore | Boolean | true | 是否还有更多数据 |
| width | Number/String | - | 容器宽度 |
| height | Number/String | - | 容器高度 |
| itemKey | Function | (item, index) => item && (item.id \|\| item.cover \|\| index) | 项目唯一标识生成函数 |
| itemsPerPage | Number | 10 | 每页加载项目数 |
| maxRowsPerRender | Number | 5 | 单次渲染最大行数 |
| overscan | Number | 2 | 视窗缓冲区倍数 |
| bufferFactor | Number | 2 | 虚拟滚动缓冲倍数 |
| minRowFillRatio | Number | 0.7 | 横向最后一行保留阈值 |
| alignLastRow | String | 'stretch' | 横向最后一行对齐(stretch/left/center) |
| clampAspectMin | Number | 0 | 最小宽高比限制 |
| clampAspectMax | Number | - | 最大宽高比限制 |
| ioRoot | String/Element | null | IntersectionObserver根元素 |
| ioRootMargin | String | '0px' | IntersectionObserver根边距 |
| ioThreshold | Number/Array | 0 | IntersectionObserver阈值 |
| fixedColumns | Boolean | false | 纵向固定列数模式 |
| maxImageConcurrency | Number | 4 | 图片尺寸测量并发数 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| load-more | - | 需要加载更多数据时触发 |
| render-start | - | 渲染开始时触发 |
| render-end | - | 渲染结束时触发 |
| resize | { width } | 容器尺寸改变时触发 |
| error | { item } | 图片加载失败时触发 |

## Slots

| 插槽名 | 作用域参数 | 说明 |
|--------|------------|------|
| default | { item, index } | 自定义项目内容 |
| header | - | 头部内容 |

## 示例

- `examples/vue2/index.html`
- `examples/vue3/index.html`

示例传参与事件：

```html
<waterfall-component
  :items="items"
  direction="horizontal"
  :row-height="180"
  :gutter="12"
  :min-row-fill-ratio="0.8"
  align-last-row="center"
  :io-threshold="0.1"
  :fixed-columns="false"
  :max-image-concurrency="4"
  @render-start="onRenderStart"
  @render-end="onRenderEnd"
  @resize="onResize"
  @error="onItemError"
  @load-more="loadMore"
>
  <template v-slot="{ item }">
    <img :src="item.cover" :alt="item.title || ''" />
  </template>
</waterfall-component>
```

### 纵向 Masonry 示例

```html
<waterfall-component
  :items="items"
  direction="vertical"
  :column-width="220"
  :gutter="12"
  :fixed-columns="true"
  :max-columns="4"
  @load-more="loadMore"
>
  <template #default="{ item }">
    <img :src="item.cover" />
  </template>
</waterfall-component>
```

### 无限加载模式

```js
data(){ return { items: [], hasMore: true } }
methods: {
  async loadMore(){
    if (!this.hasMore) return
    const base = this.items.length
    const more = Array.from({ length: 12 }).map((_, i) => ({ id: base+i, cover: `https://picsum.photos/id/${(base+i)%100}/800/600` }))
    this.items = this.items.concat(more)
    if (this.items.length > 200) this.hasMore = false
  }
}
```

## 构建

- `npm run build:vue2`
- `npm run build:vue3`

## 测试

- `npm run test`

## 本地预览

- Vue3 示例：`npm run preview:vue3`，浏览 `http://127.0.0.1:5173/examples/vue3/index.html`
- Vue2 示例：`npm run preview:vue2`，浏览 `http://127.0.0.1:5174/examples/vue2/index.html`

## 在业务项目中安装

- Vue3 项目：`npm install vue@^3.2 waterfall-component-vue3`
- Vue2 项目：`npm install vue@^2.6 waterfall-component-vue2`
- 若使用本地包：在子包目录执行 `npm pack`，在业务项目执行 `npm i <生成的tgz>` 或通过路径依赖安装。

### 在业务项目中本地安装（未发布）

- 方式一：路径依赖（推荐，简洁直连源码包）
  - 在业务项目的 `package.json` 写入：
    - Vue3：`"waterfall-component-vue3": "file:../zyt-waterfall/vue3"`
    - Vue2：`"waterfall-component-vue2": "file:../zyt-waterfall/vue2"`
  - 然后在业务项目执行：`npm install`
  - 注意：业务项目自行安装匹配的 `vue` 主版本（Vue3 或 Vue2）

- 方式二：打包本地 tgz 并安装（更接近发布形态）
  - 在本组件仓库执行：`npm run build`
  - 进入对应子包目录：
    - Vue3：`cd vue3 && npm pack`（生成 `waterfall-component-vue3-<version>.tgz`）
    - Vue2：`cd vue2 && npm pack`（生成 `waterfall-component-vue2-<version>.tgz`）
  - 在业务项目执行：`npm i ../zyt-waterfall/vue3/waterfall-component-vue3-<version>.tgz`

- 方式三：本地链接（开发联调）
  - 在组件子包中：
    - Vue3：`cd vue3 && npm link`
    - Vue2：`cd vue2 && npm link`
  - 在业务项目中：
    - Vue3：`npm link waterfall-component-vue3`
    - Vue2：`npm link waterfall-component-vue2`

#### 业务项目使用示例

```ts
// Vue3 项目入口
import { createApp } from 'vue'
import WaterfallComponent from 'waterfall-component-vue3'
createApp(App).component('WaterfallComponent', WaterfallComponent)
```

```js
// Vue2 项目入口
import Vue from 'vue'
import WaterfallComponent from 'waterfall-component-vue2'
Vue.component('WaterfallComponent', WaterfallComponent)
```
