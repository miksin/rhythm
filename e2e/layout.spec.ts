import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('renders 16 beat cells', async ({ page }) => {
  const cells = page.locator('.cell')
  await expect(cells).toHaveCount(16)
})

test('each cell has 13:9 landscape aspect ratio', async ({ page }) => {
  const cells = page.locator('.cell')
  const count = await cells.count()
  for (let i = 0; i < count; i++) {
    const box = await cells.nth(i).boundingBox()
    expect(box).not.toBeNull()
    const ratio = box!.width / box!.height
    // 13/9 ≈ 1.444 — allow ±5% tolerance for rounding
    expect(ratio).toBeGreaterThan(1.44 * 0.95)
    expect(ratio).toBeLessThan(1.44 * 1.05)
  }
})

test('VexFlow SVGs use percentage dimensions (not fixed px)', async ({ page }) => {
  const svgs = page.locator('.renderer svg')
  const count = await svgs.count()
  expect(count).toBe(16)

  for (let i = 0; i < count; i++) {
    const svg = svgs.nth(i)
    // Must have viewBox for scaling
    await expect(svg).toHaveAttribute('viewBox', /^\d+ \d+ \d+ \d+$/)
    // Inline style must use % not px — the key VexFlow override
    const style = await svg.getAttribute('style')
    expect(style).toContain('width: 100%')
    expect(style).toContain('height: 100%')
    expect(style).not.toMatch(/width:\s*\d+px/)
    expect(style).not.toMatch(/height:\s*\d+px/)
  }
})

test('all cells are visible in the viewport', async ({ page }) => {
  const cells = page.locator('.cell')
  const count = await cells.count()
  const viewport = page.viewportSize()!

  for (let i = 0; i < count; i++) {
    const box = await cells.nth(i).boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1)
  }
})
