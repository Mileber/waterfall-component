<template>
  <div class="wf-container" :style="{ width: widthStyle, height: heightStyle }">
    <div class="wf-wrapper">
      <slot name="header"></slot>
      <div class="wf" ref="container" role="list">
        <div
          class="wf-item"
          v-for="(item, index) in visibleItems"
          :key="itemKey(item, index)"
          :style="{ width: item.width + 'px', height: item.height + 'px', top: item.top + 'px', left: item.left + 'px' }"
          role="listitem"
        >
          <slot :item="item" :index="index">
            <img v-if="item.cover" :src="item.cover" :alt="item.title || ''" loading="lazy" />
          </slot>
        </div>
        <div ref="sentinel" class="wf-sentinel"></div>
      </div>
      <div class="wf-loading" v-if="loading">加载中</div>
      <div class="wf-no-more" v-if="noMore">没有更多</div>
    </div>
  </div>
</template>
<script>
import { defineComponent, nextTick } from 'vue'
import { justified, masonryVertical, filterVisible } from '../../shared/layout.ts'
export default defineComponent({
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
    widthStyle(){ return this.width ? (typeof this.width === 'number' ? this.width + 'px' : String(this.width)) : '' },
    heightStyle(){ return this.height ? (typeof this.height === 'number' ? this.height + 'px' : String(this.height)) : '' },
    noMore(){ return this.allLoadedInternal || !this.hasMore },
    visibleItems(){
      const buf = this.rowHeight * this.bufferFactor
      const top = this.viewportTop - buf
      const bottom = this.viewportBottom + buf
      return filterVisible(this.layoutItems, top, bottom, 0)
    }
  },
  mounted(){
    if (typeof window !== 'undefined'){
      this.measure()
      this.initObservers()
      this.initScrollListener()
      this.renderIfNeeded()
      nextTick(() => this.updateViewport())
    }
  },
  beforeUnmount(){
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler)
    if (this.scrollHandler){ if (this.scrollTarget) this.scrollTarget.removeEventListener('scroll', this.scrollHandler); else window.removeEventListener('scroll', this.scrollHandler) }
    if (this.observer) this.observer.disconnect()
  },
  watch: {
    items: {
      handler(newList){
        if (newList.length < this.lastItemsCount){ this.reset(); this.renderIfNeeded(); return }
        if (newList.length > this.lastItemsCount){ this.allLoadedInternal = false; this.renderIfNeeded() }
      },
      deep: true
    },
    hasMore(){ if (!this.hasMore) this.allLoadedInternal = true }
  },
  methods: {
    isSentinelNearBottom(){ const root = typeof this.ioRoot === 'string' ? document.querySelector(this.ioRoot) : this.ioRoot; const ref = this.$refs.sentinel; const nodes = Array.isArray(ref) ? ref : [ref]; const el = nodes.find(n => n && n.parentNode && n.parentNode.classList && n.parentNode.classList.contains('wf')) || nodes[0]; if (!el) return false; const margin = this.parseMargin(this.ioRootMargin); const rootRect = root ? root.getBoundingClientRect() : { top: 0, bottom: window.innerHeight }; const sRect = el.getBoundingClientRect(); return sRect.top <= (rootRect.bottom + margin.bottom) },
    parseMargin(str){ if (!str) return { top:0,right:0,bottom:0,left:0 }; const parts = String(str).split(/\s+/).map(s => parseFloat(s)||0); const [t=0,r=0,b=r,l=r] = parts; return { top:t, right:r, bottom:b, left:l } },
    debounce(fn, wait){ let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), wait) } },
    measure(){ const c = this.$refs.container; if (c) this.containerWidth = c.offsetWidth; if (!this.resizeHandler){ this.resizeHandler = this.debounce(() => { const had = this.layoutItems.length > 0; const cont = this.$refs.container; this.containerWidth = cont ? cont.offsetWidth : this.containerWidth; if (had){ const prev = this.items.slice(0, this.currentPage * this.itemsPerPage); this.reset(); nextTick(() => { this.appendItems(prev) }) } this.$emit('resize', { width: this.containerWidth }) }, 150); window.addEventListener('resize', this.resizeHandler) } },
    initObservers(){ if (this.autoLoad){ if (typeof window !== 'undefined' && window.IntersectionObserver){ const options = { root: typeof this.ioRoot === 'string' ? document.querySelector(this.ioRoot) : this.ioRoot, rootMargin: this.ioRootMargin, threshold: this.ioThreshold }
        this.observer = new IntersectionObserver((es) => { es.forEach(e => { if (e.isIntersecting) this.tryLoadMore() }) }, options); const s = this.$refs.sentinel; if (s) this.observer.observe(s) } else { this.scrollHandler = this.debounce(() => { this.tryLoadMore() }, 200); if (typeof window !== 'undefined') window.addEventListener('scroll', this.scrollHandler) } } },
    initScrollListener(){ const onScroll = this.debounce(() => this.updateViewport(), 50); const root = typeof this.ioRoot === 'string' ? document.querySelector(this.ioRoot) : this.ioRoot; const target = root || window; target.addEventListener('scroll', onScroll); this.scrollHandler = onScroll; this.scrollTarget = target },
    updateViewport(){ const root = typeof this.ioRoot === 'string' ? document.querySelector(this.ioRoot) : this.ioRoot; const st = root ? root.scrollTop : (window.pageYOffset || document.documentElement.scrollTop); const wh = root ? root.clientHeight : window.innerHeight; this.viewportTop = st; this.viewportBottom = st + wh; const margin = this.parseMargin(this.ioRootMargin); const byHeight = (this.viewportBottom + margin.bottom) >= (this.currentMaxHeight()); const bySentinel = this.isSentinelNearBottom(); const byScroll = (() => { const target = root || document.documentElement; const sh = target.scrollHeight || 0; return (st + wh + margin.bottom) >= sh })(); const nearBottom = byHeight || bySentinel || byScroll; if (this.autoLoad && nearBottom) this.tryLoadMore() },
    tryLoadMore(){ if (this.loading) return; if (this.noMore) return; this.$emit('render-start'); this.$emit('load-more') },
    reset(){ this.layoutItems = []; this.loading = false; this.currentPage = 0; this.partialRow = []; this.partialTop = 0; this.lastItemsCount = 0; this.allLoadedInternal = false; const c = this.$refs.container; if (c) c.style.height = 'auto' },
    renderIfNeeded(){ const start = this.currentPage * this.itemsPerPage; const next = this.items.slice(start, start + this.itemsPerPage); if (next.length === 0){ this.allLoadedInternal = true; return } this.appendItems(next); this.currentPage++; this.lastItemsCount = Math.max(this.lastItemsCount, start + next.length) },
    appendItems(list){ this.loading = true; const run = (tasks, limit) => { const out = []; let idx = 0; return new Promise((resolve) => { const next = () => { if (idx >= tasks.length){ resolve(out); return } const i = idx++; this.dimensions(tasks[i]).then(v => { out.push(v); next() }).catch(() => { next() }) }; const n = Math.max(1, limit); for (let k = 0; k < n; k++) next() }) }
      run(list, this.maxImageConcurrency).then(res => { const startTop = this.partialRow.length > 0 ? this.partialTop : this.currentMaxHeight(); const combined = this.partialRow.length > 0 ? this.partialRow.concat(res) : res; let layouts = []
        if (this.direction === 'vertical') {
        const contW = this.containerWidth || 1140
        const cols = Math.max(1, Math.floor((contW + this.gutter) / (this.columnWidth + this.gutter)))
        const columns = this.fixedColumns ? (this.maxColumns ? Math.max(1, this.maxColumns) : cols) : (this.maxColumns ? Math.min(cols, this.maxColumns) : cols)
        const baseHeights = Array(columns).fill(startTop)
        for (let i = 0; i < this.layoutItems.length; i++){
          const it = this.layoutItems[i]
          const col = Math.floor(parseFloat(it.left) / (this.columnWidth + this.gutter))
          if (!isNaN(col) && col >= 0 && col < columns){
            const bottomNext = parseFloat(it.top) + parseFloat(it.height) + this.gutter
            if (!isNaN(bottomNext)) baseHeights[col] = bottomNext
          }
        }
        layouts = masonryVertical(combined, contW, this.columnWidth, this.gutter, baseHeights, this.maxColumns || null, this.fixedColumns)
      } else {
        layouts = justified(combined, this.containerWidth || 1140, this.rowHeight, this.gutter, startTop, this.maxRowsPerRender, this.maxItems || null, this.hasMore, this.minRowFillRatio, this.alignLastRow, { min: this.clampAspectMin || 0, max: this.clampAspectMax })
      }
      const placed = new Set(layouts.map(it => it.id || it.cover))
      const leftover = combined.filter(it => { const k = it.id || it.cover; return !placed.has(k) })
      this.layoutItems = this.layoutItems.concat(layouts); if (layouts.length > 0){ const c = this.$refs.container; if (c) c.style.height = this.currentMaxHeight() + 'px' } this.partialRow = leftover; this.partialTop = this.currentMaxHeight(); this.loading = false; nextTick(() => this.updateViewport()); this.$emit('render-end') }).catch(() => { this.loading = false }) },
    dimensions(item){ if (item && item.width && item.height){ return Promise.resolve({ ...item, width: parseInt(item.width), height: parseInt(item.height) }) } const k = (item && (item.id || item.cover)) || Math.random().toString(36).slice(2); const c = this.cache[k]; if (c) return Promise.resolve({ ...item, width: c.width, height: c.height }); if (typeof Image === 'undefined'){ return Promise.resolve({ ...item, width: 384, height: 216 }) } return new Promise(resolve => { const img = new Image(); img.onload = () => { this.cache[k] = { width: img.naturalWidth, height: img.naturalHeight }; resolve({ ...item, width: img.naturalWidth, height: img.naturalHeight }) }; img.onerror = () => { this.$emit('error', { item }); this.cache[k] = { width: 384, height: 216 }; resolve({ ...item, width: 384, height: 216 }) }; img.src = item.cover }) },
    currentMaxHeight(){ let m = 0; this.layoutItems.forEach((it) => { const t = parseFloat(it.top); const h = parseFloat(it.height); if (!isNaN(t) && !isNaN(h)) m = Math.max(m, t + h) }); return this.layoutItems.length > 0 ? Math.round((m + this.gutter) * 100) / 100 : 0 }
  }
})
</script>
<style scoped>
.wf-container{ width:100%; position:relative }
.wf-wrapper{ position:relative; width:100% }
.wf{ position:relative; width:100% }
.wf-item{ position:absolute; box-shadow:var(--wf-shadow, 0 2px 8px rgba(0,0,0,0.1)); transition:transform .3s ease, box-shadow .3s ease; z-index:1; box-sizing:content-box; margin:0; padding:0; }
.wf-item:hover{ transform:translateY(-5px); box-shadow:var(--wf-shadow-hover, 0 5px 20px rgba(0,0,0,0.2)); z-index:10 }
.wf-item img{ width:100%; height:100%; object-fit:cover; display:block }
.wf-loading{ display:flex; justify-content:center; align-items:center; padding:20px 0; color:#666; font-size:14px }
.wf-no-more{ display:flex; justify-content:center; align-items:center; padding:20px 0; text-align:center; font-size:12px; line-height:1.6; color:#aaa }
.wf-sentinel{ position:absolute; bottom:0; width:100%; height:1px }
</style>