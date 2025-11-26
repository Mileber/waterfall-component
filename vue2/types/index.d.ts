export interface WaterfallItem { 
  id?: string; 
  cover?: string; 
  width?: number; 
  height?: number;
  title?: string;
  [key: string]: any 
}

export interface WaterfallProps {
  items: WaterfallItem[];
  direction?: 'horizontal' | 'vertical';
  maxItems?: number;
  rowHeight?: number;
  columnWidth?: number;
  gutter?: number;
  autoLoad?: boolean;
  hasMore?: boolean;
  width?: number | string;
  height?: number | string;
  overscan?: number;
  bufferFactor?: number;
  minRowFillRatio?: number;
  alignLastRow?: 'stretch' | 'left' | 'center';
  clampAspectMin?: number;
  clampAspectMax?: number;
  ioRoot?: Element | string | null;
  ioRootMargin?: string;
  ioThreshold?: number | number[];
  fixedColumns?: boolean;
  maxImageConcurrency?: number;
  itemKey?: (item: WaterfallItem, index: number) => string | number;
}

export interface WaterfallEvents {
  'load-more': () => void;
  'render-start': () => void;
  'render-end': () => void;
  resize: (e: { width: number }) => void;
  error: (e: { item: WaterfallItem }) => void;
}

export interface WaterfallComponent extends WaterfallProps, WaterfallEvents {
  // 组件实例方法
  reset: () => void;
  renderIfNeeded: () => void;
  updateViewport: () => void;
}

declare const WaterfallComponent: import('vue').ComponentOptions<Vue, any, any, any, any, any>;
export default WaterfallComponent;

export function install(Vue: import('vue').VueConstructor): void;