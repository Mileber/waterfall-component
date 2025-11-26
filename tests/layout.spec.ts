import { describe, it, expect, vi } from 'vitest'
import { justified, masonryVertical, filterVisible } from '../shared/layout'

describe('layout algorithms', () => {
  const imgs = Array.from({ length: 10 }).map((_, i) => ({ width: 800, height: 600 }))

  it('justified fills width for non-last rows', () => {
    const res = justified(imgs as any, 1000, 200, 10, 0, 2, 0, false)
    expect(res.length).toBeGreaterThan(0)
    const rows = new Map<number, number>()
    res.forEach(it => rows.set(it.top, (rows.get(it.top) || 0) + it.width))
    const firstRowWidth = rows.values().next().value as number
    expect(Math.round(firstRowWidth)).toBeCloseTo(1000, -2)
  })

  it('masonry vertical distributes into columns', () => {
    const res = masonryVertical(imgs as any, 1000, 200, 10, 0, null, false)
    expect(res.length).toBe(imgs.length)
    const cols = new Set(res.map(it => it.left))
    expect(cols.size).toBeGreaterThan(1)
  })

  it('justified last row respects minRowFillRatio', () => {
    const narrow = Array.from({ length: 3 }).map(() => ({ width: 200, height: 600 }))
    const res = justified(narrow as any, 1000, 200, 10, 0, 10, null, false, 0.9)
    const rows = new Map<number, number>()
    res.forEach(it => rows.set(it.top, (rows.get(it.top) || 0) + it.width + 10))
    const lastRowWidth = Array.from(rows.values()).pop() as number
    expect(lastRowWidth).toBeLessThan(1000)
  })

  it('filterVisible returns items intersecting viewport', () => {
    const items = [
      { width: 100, height: 50, top: 0, left: 0 },
      { width: 100, height: 50, top: 120, left: 0 },
      { width: 100, height: 50, top: 300, left: 0 }
    ] as any
    const visible = filterVisible(items, 100, 200, 0)
    expect(visible.length).toBe(1)
  })

  it('handles extreme aspect ratios with clamping', () => {
    const extremeImages = [
      { width: 50, height: 1000 }, // Very tall
      { width: 1000, height: 50 }  // Very wide
    ]
    
    // Without clamping
    const res1 = justified(extremeImages as any, 1000, 200, 10, 0, 2)
    expect(res1[0].width / res1[0].height).toBeCloseTo(0.05) // 50/1000
    expect(res1[1].width / res1[1].height).toBeCloseTo(20)   // 1000/50
    
    // With clamping
    const res2 = justified(extremeImages as any, 1000, 200, 10, 0, 2, 0, false, 0.7, 'stretch', { min: 0.1, max: 10 })
    expect(res2[0].width / res2[0].height).toBeCloseTo(0.1)  // Clamped to min
    expect(res2[1].width / res2[1].height).toBeCloseTo(10)   // Clamped to max
  })
})

// 测试虚拟滚动过滤功能
describe('virtual scrolling', () => {
  it('filterVisible works with buffer', () => {
    const items = [
      { width: 100, height: 100, top: 0, left: 0 },
      { width: 100, height: 100, top: 150, left: 0 },
      { width: 100, height: 100, top: 300, left: 0 },
      { width: 100, height: 100, top: 450, left: 0 },
      { width: 100, height: 100, top: 600, left: 0 }
    ]

    // Viewport: 200-400, Buffer: 50
    // Expected visible: items at 150, 300, 450
    const visible = filterVisible(items, 200, 400, 50)
    expect(visible.length).toBe(3)
    expect(visible[0].top).toBe(150)
    expect(visible[1].top).toBe(300)
    expect(visible[2].top).toBe(450)
  })
})

// 测试Masonry布局的不同配置
describe('masonry layout variations', () => {
  const imgs = Array.from({ length: 12 }).map((_, i) => ({ 
    width: 200 + (i % 3) * 50, 
    height: 200 + (i % 4) * 50 
  }))

  it('respects fixed column count', () => {
    const res = masonryVertical(imgs as any, 1000, 200, 10, 0, 3, true)
    const columns = new Set(res.map(it => it.left))
    expect(columns.size).toBe(3)
  })

  it('respects max column limit', () => {
    const res = masonryVertical(imgs as any, 1000, 150, 10, 0, 4, false)
    const columns = new Set(res.map(it => it.left))
    expect(columns.size).toBeLessThanOrEqual(4)
  })
})