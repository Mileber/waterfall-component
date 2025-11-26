'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function justified(images, containerWidth, rowHeight, gap, startTop, maxRows, maxItems, hasMore, minRowFillRatio = 0.7, align = 'stretch', clampAspectRatio) {
    var _a, _b;
    const out = [];
    let row = 0;
    let i = 0;
    let top = startTop;
    while (i < images.length && row < maxRows) {
        let rowImgs = [];
        let totalW = 0;
        while (i < images.length) {
            const img = images[i];
            let ar = img.width / img.height;
            if (clampAspectRatio) {
                const mn = (_a = clampAspectRatio.min) !== null && _a !== void 0 ? _a : 0;
                const mx = (_b = clampAspectRatio.max) !== null && _b !== void 0 ? _b : Infinity;
                if (mn > 0 && ar < mn)
                    ar = mn;
                if (mx < Infinity && ar > mx)
                    ar = mx;
            }
            const w = rowHeight * ar;
            if ((totalW + w + rowImgs.length * gap <= containerWidth || rowImgs.length === 0) && (!maxItems || rowImgs.length < maxItems)) {
                rowImgs.push({ ...img, calculatedWidth: w, aspectRatio: ar });
                totalW += w;
                i++;
            }
            else
                break;
        }
        if (rowImgs.length === 0)
            break;
        const isLast = (i >= images.length) || (row === maxRows - 1);
        let left = 0;
        if (!isLast) {
            const gapsW = (rowImgs.length - 1) * gap;
            const avail = containerWidth - gapsW;
            const ratio = avail / totalW;
            rowImgs.forEach(img => {
                const w = Math.round(img.calculatedWidth * ratio * 100) / 100;
                out.push({ ...img, width: w, height: rowHeight, top: Math.round(top * 100) / 100, left: Math.round(left * 100) / 100 });
                left += w + gap;
            });
        }
        else {
            const gapsW = (rowImgs.length - 1) * gap;
            const rowW = totalW + gapsW;
            const fillRatio = rowW / containerWidth;
            if (fillRatio < minRowFillRatio && hasMore) {
                break;
            }
            else if (fillRatio < minRowFillRatio && !hasMore) {
                rowImgs.forEach(img => {
                    const w = Math.round(img.calculatedWidth * 100) / 100;
                    out.push({ ...img, width: w, height: rowHeight, top: Math.round(top * 100) / 100, left: Math.round(left * 100) / 100 });
                    left += w + gap;
                });
            }
            else {
                if (align === 'stretch') {
                    const avail2 = containerWidth - gapsW;
                    const ratio2 = avail2 / totalW;
                    rowImgs.forEach(img => {
                        const w = Math.round(img.calculatedWidth * ratio2 * 100) / 100;
                        out.push({ ...img, width: w, height: rowHeight, top: Math.round(top * 100) / 100, left: Math.round(left * 100) / 100 });
                        left += w + gap;
                    });
                }
                else if (align === 'center') {
                    const rowPixel = Math.round(rowW * 100) / 100;
                    left = Math.round(((containerWidth - rowPixel) / 2) * 100) / 100;
                    rowImgs.forEach(img => {
                        const w = Math.round(img.calculatedWidth * 100) / 100;
                        out.push({ ...img, width: w, height: rowHeight, top: Math.round(top * 100) / 100, left: Math.round(left * 100) / 100 });
                        left += w + gap;
                    });
                }
                else {
                    rowImgs.forEach(img => {
                        const w = Math.round(img.calculatedWidth * 100) / 100;
                        out.push({ ...img, width: w, height: rowHeight, top: Math.round(top * 100) / 100, left: Math.round(left * 100) / 100 });
                        left += w + gap;
                    });
                }
            }
        }
        top += rowHeight + gap;
        row++;
    }
    return out;
}
function masonryVertical(images, containerWidth, columnWidth, gap, startTop, maxColumns, fixedColumns) {
    const cols = Math.max(1, Math.floor((containerWidth + gap) / (columnWidth + gap)));
    const columns = fixedColumns ? (maxColumns ? Math.max(1, maxColumns) : cols) : (maxColumns ? Math.min(cols, maxColumns) : cols);
    const heights = Array(columns).fill(typeof startTop === 'number' ? startTop : 0);
    if (Array.isArray(startTop)) {
        for (let c = 0; c < columns; c++) {
            const v = startTop[c];
            if (typeof v === 'number' && !isNaN(v))
                heights[c] = v;
        }
    }
    const out = [];
    for (let i = 0; i < images.length; i++) {
        let minH = heights[0];
        let colIndex = 0;
        for (let c = 1; c < columns; c++) {
            if (heights[c] < minH) {
                minH = heights[c];
                colIndex = c;
            }
        }
        const img = images[i];
        const ar = img.width / img.height;
        const h = Math.round((columnWidth / ar) * 100) / 100;
        const left = colIndex * (columnWidth + gap);
        const top = heights[colIndex];
        out.push({ ...img, width: columnWidth, height: h, top, left });
        heights[colIndex] = top + h + gap;
    }
    return out;
}
function filterVisible(layoutItems, top, bottom, buffer) {
    const t = top - buffer;
    const b = bottom + buffer;
    const out = [];
    for (let i = 0; i < layoutItems.length; i++) {
        const it = layoutItems[i];
        const itemBottom = it.top + it.height;
        if (itemBottom >= t && it.top <= b)
            out.push(it);
    }
    return out;
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var script = {
  name: 'WaterfallComponent',
  props: {
    items: { type: Array, default: () => [] },
    direction: { type: String, default: 'horizontal' },
    maxItems: { type: Number, default: 0 },
    rowHeight: { type: Number, default: 200 },
    columnWidth: { type: Number, default: 200 },
    gutter: { type: Number, default: 12 },
    autoLoad: { type: Boolean, default: true },
    hasMore: { type: Boolean, default: true },
    width: { type: [Number, String] },
    height: { type: [Number, String] },
    itemKey: { type: Function, default: (item, index) => item && (item.id || item.cover || index) },
    itemsPerPage: { type: Number, default: 10 },
    maxRowsPerRender: { type: Number, default: 5 },
    maxColumns: { type: Number, default: 0 },
    overscan: { type: Number, default: 2 },
    bufferFactor: { type: Number, default: 2 },
    minRowFillRatio: { type: Number, default: 0.7 },
    alignLastRow: { type: String, default: 'stretch' },
    clampAspectMin: { type: Number, default: 0 },
    clampAspectMax: { type: Number },
    ioRoot: { type: [String, Object], default: null },
    ioRootMargin: { type: String, default: '0px' },
    ioThreshold: { type: [Number, Array], default: 0 },
    fixedColumns: { type: Boolean, default: false },
    maxImageConcurrency: { type: Number, default: 4 }
  },
  data(){
    return {
      layoutItems: [],
      loading: false,
      currentPage: 0,
      containerWidth: 0,
      cache: {},
      partialRow: [],
      partialTop: 0,
      observer: null,
      scrollHandler: null,
      scrollTarget: null,
      resizeHandler: null,
      viewportTop: 0,
      viewportBottom: 0,
      lastItemsCount: 0,
      allLoadedInternal: false,
      pendingImages: new Set()
    }
  },
  computed: {
    widthStyle(){ return this.width ? (typeof this.width === 'number' ? this.width + 'px' : this.width) : '' },
    heightStyle(){ return this.height ? (typeof this.height === 'number' ? this.height + 'px' : this.height) : '' },
    noMore(){ return this.allLoadedInternal || !this.hasMore },
    visibleItems(){
      const buf = this.rowHeight * this.bufferFactor;
      const top = this.viewportTop - buf;
      const bottom = this.viewportBottom + buf;
      return filterVisible(this.layoutItems, top, bottom, 0)
    }
  },
  mounted(){
    this.measure();
    this.initObservers();
    this.initScrollListener();
    this.renderIfNeeded();
    this.$nextTick(() => this.updateViewport());
  },
  beforeDestroy(){
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    if (this.scrollHandler){ if (this.scrollTarget) this.scrollTarget.removeEventListener('scroll', this.scrollHandler); else window.removeEventListener('scroll', this.scrollHandler); }
    if (this.observer) this.observer.disconnect();
  },
  watch: {
    items: {
      handler(newList){
        if (newList.length < this.lastItemsCount){ this.reset(); this.renderIfNeeded(); return }
        if (newList.length > this.lastItemsCount){ this.allLoadedInternal = false; this.renderIfNeeded(); }
      },
      deep: true
    },
    hasMore(){ if (!this.hasMore) this.allLoadedInternal = true; }
  },
  methods: {
    debounce(fn, wait){ let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait); } },
    measure(){ const c = this.$refs.container; if (c) this.containerWidth = c.offsetWidth; if (!this.resizeHandler){ this.resizeHandler = this.debounce(() => { const had = this.layoutItems.length > 0; this.containerWidth = this.$refs.container ? this.$refs.container.offsetWidth : this.containerWidth; if (had){ const prev = this.items.slice(0, this.currentPage * this.itemsPerPage); this.reset(); this.$nextTick(() => { this.appendItems(prev); }); } this.$emit('resize', { width: this.containerWidth }); }, 150); window.addEventListener('resize', this.resizeHandler); } },
    initObservers(){ if (this.autoLoad){ if (window.IntersectionObserver){ const options = { root: typeof this.ioRoot === 'string' ? document.querySelector(this.ioRoot) : this.ioRoot, rootMargin: this.ioRootMargin, threshold: this.ioThreshold }; this.observer = new IntersectionObserver((es) => { es.forEach(e => { if (e.isIntersecting) this.tryLoadMore(); }); }, options); const ref = this.$refs.sentinel; const nodes = Array.isArray(ref) ? ref : [ref]; nodes.forEach(el => { if (el) this.observer.observe(el); }); } else { this.scrollHandler = this.debounce(() => { this.tryLoadMore(); }, 200); const root = typeof this.ioRoot === 'string' ? document.querySelector(this.ioRoot) : this.ioRoot; const target = root || window; target.addEventListener('scroll', this.scrollHandler); } } },
    initScrollListener(){ const onScroll = this.debounce(() => this.updateViewport(), 50); const root = typeof this.ioRoot === 'string' ? document.querySelector(this.ioRoot) : this.ioRoot; const target = root || window; target.addEventListener('scroll', onScroll); this.scrollHandler = onScroll; this.scrollTarget = target; },
    updateViewport(){
      const root = typeof this.ioRoot === 'string' ? document.querySelector(this.ioRoot) : this.ioRoot;
      const st = root ? root.scrollTop : (window.pageYOffset || document.documentElement.scrollTop);
      const wh = root ? root.clientHeight : window.innerHeight;
      this.viewportTop = st;
      this.viewportBottom = st + wh;
      if (this.autoLoad && !this.loading && !this.noMore){
        const margin = this.parseMargin(this.ioRootMargin);
        const target = root || document.documentElement;
        const sh = target.scrollHeight || 0;
        if ((st + wh + margin.bottom) >= sh) this.tryLoadMore();
      }
    },
    parseMargin(str){ if (!str) return { top:0,right:0,bottom:0,left:0 }; const parts = String(str).split(/\s+/).map(s => parseFloat(s)||0); const [t=0,r=0,b=r,l=r] = parts; return { top:t, right:r, bottom:b, left:l } },
  
    tryLoadMore(){ if (this.loading) return; if (this.noMore) return; this.$emit('render-start'); this.$emit('load-more'); },
    reset(){ this.layoutItems = []; this.loading = false; this.currentPage = 0; this.partialRow = []; this.partialTop = 0; this.lastItemsCount = 0; this.allLoadedInternal = false; if (this.$refs.container) this.$refs.container.style.height = 'auto'; },
    renderIfNeeded(){ const start = this.currentPage * this.itemsPerPage; const next = this.items.slice(start, start + this.itemsPerPage); if (next.length === 0){ this.allLoadedInternal = true; return } this.appendItems(next); this.currentPage++; this.lastItemsCount = Math.max(this.lastItemsCount, start + next.length); },
    appendItems(list){ this.loading = true; const run = (tasks, limit) => { const out = []; let idx = 0; return new Promise(resolve => { const next = () => { if (idx >= tasks.length){ resolve(out); return } const i = idx++; this.dimensions(tasks[i]).then(v => { out.push(v); next(); }).catch(() => { next(); }); }; const n = Math.max(1, limit); for (let k = 0; k < n; k++) next(); }) };
      run(list, this.maxImageConcurrency).then(res => { const startTop = this.partialRow.length > 0 ? this.partialTop : this.currentMaxHeight(); const combined = this.partialRow.length > 0 ? this.partialRow.concat(res) : res; let layouts = [];
      if (this.direction === 'vertical') {
        const contW = this.containerWidth || 1140;
        const cols = Math.max(1, Math.floor((contW + this.gutter) / (this.columnWidth + this.gutter)));
        const columns = this.fixedColumns ? (this.maxColumns ? Math.max(1, this.maxColumns) : cols) : (this.maxColumns ? Math.min(cols, this.maxColumns) : cols);
        const baseHeights = Array(columns).fill(startTop);
        for (let i = 0; i < this.layoutItems.length; i++){
          const it = this.layoutItems[i];
          const col = Math.floor(parseFloat(it.left) / (this.columnWidth + this.gutter));
          if (!isNaN(col) && col >= 0 && col < columns){
            const bottomNext = parseFloat(it.top) + parseFloat(it.height) + this.gutter;
            if (!isNaN(bottomNext)) baseHeights[col] = bottomNext;
          }
        }
        layouts = masonryVertical(combined, contW, this.columnWidth, this.gutter, baseHeights, this.maxColumns || null, this.fixedColumns);
      } else {
        layouts = justified(combined, this.containerWidth || 1140, this.rowHeight, this.gutter, startTop, this.maxRowsPerRender, this.maxItems || null, this.hasMore, this.minRowFillRatio, this.alignLastRow, { min: this.clampAspectMin || 0, max: this.clampAspectMax });
      }
      const placed = new Set(layouts.map(it => it.id || it.cover));
      const leftover = combined.filter(it => { const k = it.id || it.cover; return !placed.has(k) });
      this.layoutItems = this.layoutItems.concat(layouts); if (layouts.length > 0){ if (this.$refs.container) this.$refs.container.style.height = this.currentMaxHeight() + 'px'; }
      this.partialRow = leftover;
      this.partialTop = this.currentMaxHeight();
      this.loading = false; this.$nextTick(() => { this.updateViewport(); this.$emit('render-end'); }); }).catch(() => { this.loading = false; }); },
    dimensions(item){ if (item && item.width && item.height){ return Promise.resolve({ ...item, width: parseInt(item.width), height: parseInt(item.height) }) } const k = (item && (item.id || item.cover)) || Math.random().toString(36).slice(2); const c = this.cache[k]; if (c) return Promise.resolve({ ...item, width: c.width, height: c.height }); if (typeof Image === 'undefined'){ return Promise.resolve({ ...item, width: 384, height: 216 }) } return new Promise(resolve => { const img = new Image(); img.onload = () => { this.cache[k] = { width: img.naturalWidth, height: img.naturalHeight }; resolve({ ...item, width: img.naturalWidth, height: img.naturalHeight }); }; img.onerror = () => { this.$emit('error', { item }); this.cache[k] = { width: 384, height: 216 }; resolve({ ...item, width: 384, height: 216 }); }; img.src = item.cover; }) },
    currentMaxHeight(){ let m = 0; this.layoutItems.forEach(it => { const t = parseFloat(it.top); const h = parseFloat(it.height); if (!isNaN(t) && !isNaN(h)) m = Math.max(m, t + h); }); return this.layoutItems.length > 0 ? Math.round((m + this.gutter) * 100) / 100 : 0 }
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function () {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "wf-container",
      style: { width: _vm.widthStyle, height: _vm.heightStyle },
    },
    [
      _c(
        "div",
        { staticClass: "wf-wrapper" },
        [
          _vm._t("header"),
          _vm._v(" "),
          _c(
            "div",
            { ref: "container", staticClass: "wf", attrs: { role: "list" } },
            _vm._l(_vm.visibleItems, function (item, index) {
              return _c(
                "div",
                {
                  key: _vm.itemKey(item, index),
                  staticClass: "wf-item",
                  style: {
                    width: item.width + "px",
                    height: item.height + "px",
                    top: item.top + "px",
                    left: item.left + "px",
                  },
                  attrs: { role: "listitem" },
                },
                [
                  _vm._t(
                    "default",
                    function () {
                      return [
                        item.cover
                          ? _c("img", {
                              attrs: {
                                src: item.cover,
                                alt: item.title || "",
                                loading: "lazy",
                              },
                            })
                          : _vm._e(),
                      ]
                    },
                    { item: item, index: index }
                  ),
                ],
                2
              )
            }),
            0
          ),
          _vm._v(" "),
          _c("div", { ref: "sentinel", staticClass: "wf-sentinel" }),
          _vm._v(" "),
          _vm.loading
            ? _c("div", { staticClass: "wf-loading" }, [_vm._v("加载中")])
            : _vm._e(),
          _vm._v(" "),
          _vm.noMore
            ? _c("div", { staticClass: "wf-no-more" }, [_vm._v("没有更多")])
            : _vm._e(),
        ],
        2
      ),
    ]
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-7307df2e_0", { source: "\n.wf-container[data-v-7307df2e]{ width:100%; position:relative\n}\n.wf-wrapper[data-v-7307df2e]{ position:relative; width:100%\n}\n.wf[data-v-7307df2e]{ position:relative; width:100%\n}\n.wf-item[data-v-7307df2e]{ position:absolute; box-shadow:var(--wf-shadow, 0 2px 8px rgba(0,0,0,0.1)); transition:transform .3s ease, box-shadow .3s ease; z-index:1; box-sizing:content-box; margin:0; padding:0;\n}\n.wf-item[data-v-7307df2e]:hover{ transform:translateY(-5px); box-shadow:var(--wf-shadow-hover, 0 5px 20px rgba(0,0,0,0.2)); z-index:10\n}\n.wf-item img[data-v-7307df2e]{ width:100%; height:100%; object-fit:cover; display:block\n}\n.wf-loading[data-v-7307df2e]{ display:flex; justify-content:center; align-items:center; padding:20px 0; color:#666; font-size:14px\n}\n.wf-no-more[data-v-7307df2e]{ display:flex; justify-content:center; align-items:center; padding:20px 0; text-align:center; font-size:12px; line-height:1.6; color:#aaa\n}\n.wf-sentinel[data-v-7307df2e]{ position:absolute; bottom:0; width:100%; height:1px\n}\n", map: {"version":3,"sources":["D:\\derya\\projects\\gitlab\\zyt-waterfall\\vue2\\src\\WaterfallComponent.vue"],"names":[],"mappings":";AAiKA,gCAAA,UAAA,EAAA;AAAA;AACA,8BAAA,iBAAA,EAAA;AAAA;AACA,sBAAA,iBAAA,EAAA;AAAA;AACA,2BAAA,iBAAA,EAAA,sDAAA,EAAA,kDAAA,EAAA,SAAA,EAAA,sBAAA,EAAA,QAAA,EAAA,SAAA;AAAA;AACA,iCAAA,0BAAA,EAAA,6DAAA,EAAA;AAAA;AACA,+BAAA,UAAA,EAAA,WAAA,EAAA,gBAAA,EAAA;AAAA;AACA,8BAAA,YAAA,EAAA,sBAAA,EAAA,kBAAA,EAAA,cAAA,EAAA,UAAA,EAAA;AAAA;AACA,8BAAA,YAAA,EAAA,sBAAA,EAAA,kBAAA,EAAA,cAAA,EAAA,iBAAA,EAAA,cAAA,EAAA,eAAA,EAAA;AAAA;AACA,+BAAA,iBAAA,EAAA,QAAA,EAAA,UAAA,EAAA;AAAA","file":"WaterfallComponent.vue","sourcesContent":["<template>\n  <div class=\"wf-container\" :style=\"{ width: widthStyle, height: heightStyle }\">\n    <div class=\"wf-wrapper\">\n      <slot name=\"header\"></slot>\n      <div class=\"wf\" ref=\"container\" role=\"list\">\n        <div\n          class=\"wf-item\"\n          v-for=\"(item, index) in visibleItems\"\n          :key=\"itemKey(item, index)\"\n          :style=\"{ width: item.width + 'px', height: item.height + 'px', top: item.top + 'px', left: item.left + 'px' }\"\n          role=\"listitem\"\n        >\n          <slot :item=\"item\" :index=\"index\">\n            <img v-if=\"item.cover\" :src=\"item.cover\" :alt=\"item.title || ''\" loading=\"lazy\" />\n          </slot>\n        </div>\n      </div>\n      <div ref=\"sentinel\" class=\"wf-sentinel\"></div>\n      <div class=\"wf-loading\" v-if=\"loading\">加载中</div>\n      <div class=\"wf-no-more\" v-if=\"noMore\">没有更多</div>\n    </div>\n  </div>\n</template>\n<script>\nimport { justified, masonryVertical, filterVisible } from '../../shared/layout.ts'\nexport default {\n  name: 'WaterfallComponent',\n  props: {\n    items: { type: Array, default: () => [] },\n    direction: { type: String, default: 'horizontal' },\n    maxItems: { type: Number, default: 0 },\n    rowHeight: { type: Number, default: 200 },\n    columnWidth: { type: Number, default: 200 },\n    gutter: { type: Number, default: 12 },\n    autoLoad: { type: Boolean, default: true },\n    hasMore: { type: Boolean, default: true },\n    width: { type: [Number, String] },\n    height: { type: [Number, String] },\n    itemKey: { type: Function, default: (item, index) => item && (item.id || item.cover || index) },\n    itemsPerPage: { type: Number, default: 10 },\n    maxRowsPerRender: { type: Number, default: 5 },\n    maxColumns: { type: Number, default: 0 },\n    overscan: { type: Number, default: 2 },\n    bufferFactor: { type: Number, default: 2 },\n    minRowFillRatio: { type: Number, default: 0.7 },\n    alignLastRow: { type: String, default: 'stretch' },\n    clampAspectMin: { type: Number, default: 0 },\n    clampAspectMax: { type: Number },\n    ioRoot: { type: [String, Object], default: null },\n    ioRootMargin: { type: String, default: '0px' },\n    ioThreshold: { type: [Number, Array], default: 0 },\n    fixedColumns: { type: Boolean, default: false },\n    maxImageConcurrency: { type: Number, default: 4 }\n  },\n  data(){\n    return {\n      layoutItems: [],\n      loading: false,\n      currentPage: 0,\n      containerWidth: 0,\n      cache: {},\n      partialRow: [],\n      partialTop: 0,\n      observer: null,\n      scrollHandler: null,\n      scrollTarget: null,\n      resizeHandler: null,\n      viewportTop: 0,\n      viewportBottom: 0,\n      lastItemsCount: 0,\n      allLoadedInternal: false,\n      pendingImages: new Set()\n    }\n  },\n  computed: {\n    widthStyle(){ return this.width ? (typeof this.width === 'number' ? this.width + 'px' : this.width) : '' },\n    heightStyle(){ return this.height ? (typeof this.height === 'number' ? this.height + 'px' : this.height) : '' },\n    noMore(){ return this.allLoadedInternal || !this.hasMore },\n    visibleItems(){\n      const buf = this.rowHeight * this.bufferFactor\n      const top = this.viewportTop - buf\n      const bottom = this.viewportBottom + buf\n      return filterVisible(this.layoutItems, top, bottom, 0)\n    }\n  },\n  mounted(){\n    this.measure()\n    this.initObservers()\n    this.initScrollListener()\n    this.renderIfNeeded()\n    this.$nextTick(() => this.updateViewport())\n  },\n  beforeDestroy(){\n    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler)\n    if (this.scrollHandler){ if (this.scrollTarget) this.scrollTarget.removeEventListener('scroll', this.scrollHandler); else window.removeEventListener('scroll', this.scrollHandler) }\n    if (this.observer) this.observer.disconnect()\n  },\n  watch: {\n    items: {\n      handler(newList){\n        if (newList.length < this.lastItemsCount){ this.reset(); this.renderIfNeeded(); return }\n        if (newList.length > this.lastItemsCount){ this.allLoadedInternal = false; this.renderIfNeeded() }\n      },\n      deep: true\n    },\n    hasMore(){ if (!this.hasMore) this.allLoadedInternal = true }\n  },\n  methods: {\n    debounce(fn, wait){ let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait) } },\n    measure(){ const c = this.$refs.container; if (c) this.containerWidth = c.offsetWidth; if (!this.resizeHandler){ this.resizeHandler = this.debounce(() => { const had = this.layoutItems.length > 0; this.containerWidth = this.$refs.container ? this.$refs.container.offsetWidth : this.containerWidth; if (had){ const prev = this.items.slice(0, this.currentPage * this.itemsPerPage); this.reset(); this.$nextTick(() => { this.appendItems(prev) }) } this.$emit('resize', { width: this.containerWidth }) }, 150); window.addEventListener('resize', this.resizeHandler) } },\n    initObservers(){ if (this.autoLoad){ if (window.IntersectionObserver){ const options = { root: typeof this.ioRoot === 'string' ? document.querySelector(this.ioRoot) : this.ioRoot, rootMargin: this.ioRootMargin, threshold: this.ioThreshold }; this.observer = new IntersectionObserver((es) => { es.forEach(e => { if (e.isIntersecting) this.tryLoadMore() }) }, options); const ref = this.$refs.sentinel; const nodes = Array.isArray(ref) ? ref : [ref]; nodes.forEach(el => { if (el) this.observer.observe(el) }) } else { this.scrollHandler = this.debounce(() => { this.tryLoadMore() }, 200); const root = typeof this.ioRoot === 'string' ? document.querySelector(this.ioRoot) : this.ioRoot; const target = root || window; target.addEventListener('scroll', this.scrollHandler) } } },\n    initScrollListener(){ const onScroll = this.debounce(() => this.updateViewport(), 50); const root = typeof this.ioRoot === 'string' ? document.querySelector(this.ioRoot) : this.ioRoot; const target = root || window; target.addEventListener('scroll', onScroll); this.scrollHandler = onScroll; this.scrollTarget = target },\n    updateViewport(){\n      const root = typeof this.ioRoot === 'string' ? document.querySelector(this.ioRoot) : this.ioRoot\n      const st = root ? root.scrollTop : (window.pageYOffset || document.documentElement.scrollTop)\n      const wh = root ? root.clientHeight : window.innerHeight\n      this.viewportTop = st\n      this.viewportBottom = st + wh\n      if (this.autoLoad && !this.loading && !this.noMore){\n        const margin = this.parseMargin(this.ioRootMargin)\n        const target = root || document.documentElement\n        const sh = target.scrollHeight || 0\n        if ((st + wh + margin.bottom) >= sh) this.tryLoadMore()\n      }\n    },\n    parseMargin(str){ if (!str) return { top:0,right:0,bottom:0,left:0 }; const parts = String(str).split(/\\s+/).map(s => parseFloat(s)||0); const [t=0,r=0,b=r,l=r] = parts; return { top:t, right:r, bottom:b, left:l } },\n  \n    tryLoadMore(){ if (this.loading) return; if (this.noMore) return; this.$emit('render-start'); this.$emit('load-more') },\n    reset(){ this.layoutItems = []; this.loading = false; this.currentPage = 0; this.partialRow = []; this.partialTop = 0; this.lastItemsCount = 0; this.allLoadedInternal = false; if (this.$refs.container) this.$refs.container.style.height = 'auto' },\n    renderIfNeeded(){ const start = this.currentPage * this.itemsPerPage; const next = this.items.slice(start, start + this.itemsPerPage); if (next.length === 0){ this.allLoadedInternal = true; return } this.appendItems(next); this.currentPage++; this.lastItemsCount = Math.max(this.lastItemsCount, start + next.length) },\n    appendItems(list){ this.loading = true; const run = (tasks, limit) => { const out = []; let idx = 0; return new Promise(resolve => { const next = () => { if (idx >= tasks.length){ resolve(out); return } const i = idx++; this.dimensions(tasks[i]).then(v => { out.push(v); next() }).catch(() => { next() }) }; const n = Math.max(1, limit); for (let k = 0; k < n; k++) next() }) }\n      run(list, this.maxImageConcurrency).then(res => { const startTop = this.partialRow.length > 0 ? this.partialTop : this.currentMaxHeight(); const combined = this.partialRow.length > 0 ? this.partialRow.concat(res) : res; let layouts = []\n      if (this.direction === 'vertical') {\n        const contW = this.containerWidth || 1140\n        const cols = Math.max(1, Math.floor((contW + this.gutter) / (this.columnWidth + this.gutter)))\n        const columns = this.fixedColumns ? (this.maxColumns ? Math.max(1, this.maxColumns) : cols) : (this.maxColumns ? Math.min(cols, this.maxColumns) : cols)\n        const baseHeights = Array(columns).fill(startTop)\n        for (let i = 0; i < this.layoutItems.length; i++){\n          const it = this.layoutItems[i]\n          const col = Math.floor(parseFloat(it.left) / (this.columnWidth + this.gutter))\n          if (!isNaN(col) && col >= 0 && col < columns){\n            const bottomNext = parseFloat(it.top) + parseFloat(it.height) + this.gutter\n            if (!isNaN(bottomNext)) baseHeights[col] = bottomNext\n          }\n        }\n        layouts = masonryVertical(combined, contW, this.columnWidth, this.gutter, baseHeights, this.maxColumns || null, this.fixedColumns)\n      } else {\n        layouts = justified(combined, this.containerWidth || 1140, this.rowHeight, this.gutter, startTop, this.maxRowsPerRender, this.maxItems || null, this.hasMore, this.minRowFillRatio, this.alignLastRow, { min: this.clampAspectMin || 0, max: this.clampAspectMax })\n      }\n      const placed = new Set(layouts.map(it => it.id || it.cover))\n      const leftover = combined.filter(it => { const k = it.id || it.cover; return !placed.has(k) })\n      this.layoutItems = this.layoutItems.concat(layouts); if (layouts.length > 0){ if (this.$refs.container) this.$refs.container.style.height = this.currentMaxHeight() + 'px' }\n      this.partialRow = leftover\n      this.partialTop = this.currentMaxHeight()\n      this.loading = false; this.$nextTick(() => { this.updateViewport(); this.$emit('render-end') }) }).catch(() => { this.loading = false }) },\n    dimensions(item){ if (item && item.width && item.height){ return Promise.resolve({ ...item, width: parseInt(item.width), height: parseInt(item.height) }) } const k = (item && (item.id || item.cover)) || Math.random().toString(36).slice(2); const c = this.cache[k]; if (c) return Promise.resolve({ ...item, width: c.width, height: c.height }); if (typeof Image === 'undefined'){ return Promise.resolve({ ...item, width: 384, height: 216 }) } return new Promise(resolve => { const img = new Image(); img.onload = () => { this.cache[k] = { width: img.naturalWidth, height: img.naturalHeight }; resolve({ ...item, width: img.naturalWidth, height: img.naturalHeight }) }; img.onerror = () => { this.$emit('error', { item }); this.cache[k] = { width: 384, height: 216 }; resolve({ ...item, width: 384, height: 216 }) }; img.src = item.cover }) },\n    currentMaxHeight(){ let m = 0; this.layoutItems.forEach(it => { const t = parseFloat(it.top); const h = parseFloat(it.height); if (!isNaN(t) && !isNaN(h)) m = Math.max(m, t + h) }); return this.layoutItems.length > 0 ? Math.round((m + this.gutter) * 100) / 100 : 0 }\n  }\n}\n</script>\n<style scoped>\n.wf-container{ width:100%; position:relative }\n.wf-wrapper{ position:relative; width:100% }\n.wf{ position:relative; width:100% }\n.wf-item{ position:absolute; box-shadow:var(--wf-shadow, 0 2px 8px rgba(0,0,0,0.1)); transition:transform .3s ease, box-shadow .3s ease; z-index:1; box-sizing:content-box; margin:0; padding:0; }\n.wf-item:hover{ transform:translateY(-5px); box-shadow:var(--wf-shadow-hover, 0 5px 20px rgba(0,0,0,0.2)); z-index:10 }\n.wf-item img{ width:100%; height:100%; object-fit:cover; display:block }\n.wf-loading{ display:flex; justify-content:center; align-items:center; padding:20px 0; color:#666; font-size:14px }\n.wf-no-more{ display:flex; justify-content:center; align-items:center; padding:20px 0; text-align:center; font-size:12px; line-height:1.6; color:#aaa }\n.wf-sentinel{ position:absolute; bottom:0; width:100%; height:1px }\n</style>\n"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = "data-v-7307df2e";
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

  var Component = __vue_component__;

const install = function(Vue){ if (install.installed) return; Vue.component('WaterfallComponent', Component); };

exports.default = Component;
exports.install = install;
