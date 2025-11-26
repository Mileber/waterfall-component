## 页面结构
- 左侧：配置面板（参数表单与操作按钮）
- 右侧：瀑布流预览区（单个 `waterfall-component`，使用同一数据源）
- 布局采用 `flex`，右侧区域自适应宽度，容器宽度绑定为右侧实际宽度或由配置控制

## 单一数据源
- 仅维护一个数组 `items` 与标记 `hasMore`
- 生成数据：`createItems(base,count)` 随机 `width/height`，内联 `data:image/svg+xml`（带编号）作为 `cover`
- 操作：`重置数据`、`加载更多` 按钮；自动滚动加载通过组件已有的 `@loadMore` 事件触发同一 `loadMore()`

## 配置项（左侧表单）
- 通用：
  - `direction`（select：`horizontal`/`vertical`）
  - `gutter`、`itemsPerPage`、`maxRowsPerRender`、`overscan`、`bufferFactor`
  - `width`/`height`（容器样式）
  - `autoLoad`（开关）
  - `clampAspectMin`/`clampAspectMax`
- 横向专属：
  - `rowHeight`、`maxItems`、`minRowFillRatio`、`alignLastRow`（`stretch|center|left`）
- 纵向专属：
  - `columnWidth`、`maxColumns`、`fixedColumns`

## 组件绑定
- 右侧瀑布流：
  - 单个 `<waterfall-component>`，将所有 props 通过 `v-bind="config"` + 独立绑定（如 `direction`）传入
  - 使用相同 `items` 与 `hasMore`
  - 插槽默认渲染 `<img :src="item.cover">` 并叠加左上角编号 `#{{item.id}}`
- 为避免部分 props 改动后渲染状态残留，增加 `:key="configKey"`（基于关键配置拼接字符串）以强制重渲染
- 事件：`@renderStart/@renderEnd/@resize/@error/@loadMore` 打印日志并走统一 `loadMore()`

## 行为逻辑
- `loadMore()`：节流 `loadingGlobal`，每次追加 `itemsPerPage` 或固定数量；`items.length` 超阈值后 `hasMore=false`
- `resetAndLoad()`：清空数据、重置 `hasMore=true`，立即调用 `loadMore()`
- 当下列配置改变时触发 `resetAndLoad()`：`direction`、`rowHeight`、`columnWidth`、`maxItems`、`maxColumns`、`alignLastRow`、`fixedColumns`、`clampAspect*`、`gutter`
- 宽高变更时仅触发组件 `measure()` 与自适应（可通过 `key` 强制重渲染实现）

## 代码改动范围
- 仅更新 `examples/vue2/index.html`：
  - 替换为左右布局模板与样式
  - 注入配置表单、按钮与脚本逻辑
  - 将当前两个示例整合为一个组件，使用 `config.direction` 切换
- 不改动 `vue2/dist/index.esm.js`（已修复纵向保留源项 `id/cover`）

## 校验与演示
- 打开 `http://localhost:5173/examples/vue2/index.html`
- 在左侧调整参数，右侧即时反映；向下滚动触发自动加载；也可点击“加载更多”按钮
- 验证横向：行等高、按比例拉伸，末行按配置对齐；验证纵向：列宽固定、不同高度堆叠

## 兼容与细节
- 继续使用国内镜像全局 `Vue`（`window.Vue`），避免 ESM 外网依赖
- 数据使用内联 SVG，保证离线可演示
- 保留 `IntersectionObserver` 自动加载；不支持时降级为滚动监听

## 下一步
- 我将直接在 `examples/vue2/index.html` 实现上述改动并自测；如需保留“双组件对照”模式，也可在右侧加 Tab 切换两个实例，仍共用同一数据源。