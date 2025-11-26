export interface LayoutItem { width: number; height: number; top: number; left: number; calculatedWidth?: number; aspectRatio?: number }
export interface SourceItem { width?: number; height?: number; cover?: string; id?: string }

export function justified(images: Array<SourceItem & { width: number; height: number }>, containerWidth: number, rowHeight: number, gap: number, startTop: number, maxRows: number, maxItems?: number | null, hasMore?: boolean, minRowFillRatio: number = 0.7, align: 'stretch' | 'left' | 'center' = 'stretch', clampAspectRatio?: { min?: number; max?: number }) {
  const out: LayoutItem[] = []
  let row = 0
  let i = 0
  let top = startTop
  while (i < images.length && row < maxRows){
    let rowImgs: any[] = []
    let totalW = 0
    while (i < images.length){
      const img = images[i]
      let ar = img.width / img.height
      if (clampAspectRatio){
        const mn = clampAspectRatio.min ?? 0
        const mx = clampAspectRatio.max ?? Infinity
        if (mn > 0 && ar < mn) ar = mn
        if (mx < Infinity && ar > mx) ar = mx
      }
      const w = rowHeight * ar
      if ((totalW + w + rowImgs.length * gap <= containerWidth || rowImgs.length === 0) && (!maxItems || rowImgs.length < maxItems)){
        rowImgs.push({ ...img, calculatedWidth: w, aspectRatio: ar })
        totalW += w
        i++
      } else break
    }
    if (rowImgs.length === 0) break
    const isLast = (i >= images.length) || (row === maxRows - 1)
    let left = 0
    if (!isLast){
      const gapsW = (rowImgs.length - 1) * gap
      const avail = containerWidth - gapsW
      const ratio = avail / totalW
      rowImgs.forEach(img => {
        // 如果只有一个项目且使用stretch，则不改变其宽高比
        let w, h;
        if (rowImgs.length === 1 && align === 'stretch') {
          w = img.calculatedWidth;
          h = rowHeight;
        } else {
          w = Math.round(img.calculatedWidth * ratio * 100) / 100;
          h = rowHeight;
        }
        out.push({ ...img, width: w, height: h, top: Math.round(top * 100) / 100, left: Math.round(left * 100) / 100, aspectRatio: img.aspectRatio })
        left += w + gap
      })
    } else {
      const gapsW = (rowImgs.length - 1) * gap
      const rowW = totalW + gapsW
      const fillRatio = rowW / containerWidth
      if (fillRatio < minRowFillRatio && hasMore){
        break
      } else if (fillRatio < minRowFillRatio && !hasMore){
        rowImgs.forEach(img => {
          const w = Math.round(img.calculatedWidth * 100) / 100
          // 使用计算后的宽高比而不是原始宽高比
          out.push({ ...img, width: w, height: rowHeight, top: Math.round(top * 100) / 100, left: Math.round(left * 100) / 100, aspectRatio: img.aspectRatio })
          left += w + gap
        })
      } else {
        if (align === 'stretch'){
          const avail2 = containerWidth - gapsW
          const ratio2 = avail2 / totalW
          rowImgs.forEach(img => {
            // 如果只有一个项目且使用stretch，则不改变其宽高比
            let w, h;
            if (rowImgs.length === 1) {
              w = img.calculatedWidth;
              h = rowHeight;
            } else {
              w = Math.round(img.calculatedWidth * ratio2 * 100) / 100;
              h = rowHeight;
            }
            out.push({ ...img, width: w, height: h, top: Math.round(top * 100) / 100, left: Math.round(left * 100) / 100, aspectRatio: img.aspectRatio })
            left += w + gap
          })
        } else if (align === 'center'){
          const rowPixel = Math.round(rowW * 100) / 100
          left = Math.round(((containerWidth - rowPixel) / 2) * 100) / 100
          rowImgs.forEach(img => {
            const w = Math.round(img.calculatedWidth * 100) / 100
            // 使用计算后的宽高比而不是原始宽高比
            out.push({ ...img, width: w, height: rowHeight, top: Math.round(top * 100) / 100, left: Math.round(left * 100) / 100, aspectRatio: img.aspectRatio })
            left += w + gap
          })
        } else {
          rowImgs.forEach(img => {
            const w = Math.round(img.calculatedWidth * 100) / 100
            // 使用计算后的宽高比而不是原始宽高比
            out.push({ ...img, width: w, height: rowHeight, top: Math.round(top * 100) / 100, left: Math.round(left * 100) / 100, aspectRatio: img.aspectRatio })
            left += w + gap
          })
        }
      }
    }
    top += rowHeight + gap
    row++
  }
  return out
}

export function masonryVertical(images: Array<SourceItem & { width: number; height: number }>, containerWidth: number, columnWidth: number, gap: number, startTop: number | number[], maxColumns?: number | null, fixedColumns?: boolean){
  const cols = Math.max(1, Math.floor((containerWidth + gap) / (columnWidth + gap)))
  const columns = fixedColumns ? (maxColumns ? Math.max(1, maxColumns) : cols) : (maxColumns ? Math.min(cols, maxColumns) : cols)
  const heights: number[] = Array(columns).fill(typeof startTop === 'number' ? startTop : 0)
  if (Array.isArray(startTop)){
    for (let c = 0; c < columns; c++){
      const v = startTop[c]
      if (typeof v === 'number' && !isNaN(v)) heights[c] = v
    }
  }
  const out: LayoutItem[] = []
  for (let i = 0; i < images.length; i++){
    let minH = heights[0]
    let colIndex = 0
    for (let c = 1; c < columns; c++){
      if (heights[c] < minH){ minH = heights[c]; colIndex = c }
    }
    const img = images[i]
    let ar = img.width / img.height
    // Apply aspect ratio clamping for masonry as well
    // 注意：这里的 clampAspectRatio 参数应该从函数参数中获取，但当前函数签名没有该参数，因此我们暂时不处理
    const h = Math.round((columnWidth / ar) * 100) / 100
    const left = colIndex * (columnWidth + gap)
    const top = heights[colIndex]
    out.push({ ...img, width: columnWidth, height: h, top, left })
    heights[colIndex] = top + h + gap
  }
  return out
}

export function filterVisible(layoutItems: Array<LayoutItem>, top: number, bottom: number, buffer: number){
  const t = top - buffer
  const b = bottom + buffer
  const out: LayoutItem[] = []
  for (let i = 0; i < layoutItems.length; i++){
    const it = layoutItems[i]
    const itemBottom = it.top + it.height
    if (itemBottom >= t && it.top <= b) out.push(it)
  }
  return out
}
