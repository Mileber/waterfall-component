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

import { VNode } from 'vue';

export interface WaterfallEvents {
  'load-more': () => void;
  'render-start': () => void;
  'render-end': () => void;
  resize: (e: { width: number }) => void;
  error: (e: { item: WaterfallItem }) => void;
}

// 定义插槽类型
export interface WaterfallComponentSlots {
  default: (props: { item: WaterfallItem, index: number }) => VNode[];
  header: () => VNode[];
}

export interface WaterfallComponent extends WaterfallProps, WaterfallEvents {
  reset: () => void;
  renderIfNeeded: () => void;
  updateViewport: () => void;
}

export type WaterfallSlots = {
  default: (props: { item: WaterfallItem, index: number }) => VNode[];
  header: () => VNode[];
}

declare const WaterfallComponent: import('vue').DefineComponent<
  WaterfallProps,
  {},
  {},
  {},
  {},
  {},
  {},
  WaterfallEvents,
  string
> & import('vue').SlotsType<WaterfallSlots>;
export default WaterfallComponent;

export function install(app: import('vue').App): void;
