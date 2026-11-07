import { expect, test } from "@playwright/test";
import { installBuiltApp } from "./fixtures/built-app";
test("offscreen content reveals on scroll once and remains visible afterward", async ({
  page,
}) => {
  await installBuiltApp(page);
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const card = page.locator(".skill-group").first();
  await expect(card).toHaveAttribute("data-scroll-reveal", "pending");
  await expect(card).toHaveCSS("opacity", "0");
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute("data-scroll-reveal", "visible");
  await expect
    .poll(() => card.evaluate((el) => el.getAnimations().length))
    .toBe(0);
  await expect(card).toHaveCSS("opacity", "1");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => new Promise(requestAnimationFrame));
  await card.scrollIntoViewIfNeeded();
  await expect(card).toHaveAttribute("data-scroll-reveal", "visible");
  expect(await card.evaluate((el) => el.getAnimations().length)).toBe(0);
  await expect(card).toHaveCSS("opacity", "1");
});
test("changing to reduced motion immediately reveals all pending content", async ({
  page,
}) => {
  await installBuiltApp(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const footer = page.locator(".site-footer");
  await expect(footer).toHaveAttribute("data-scroll-reveal", "pending");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator('[data-scroll-reveal="pending"]')).toHaveCount(0);
  await expect(footer).toHaveCSS("opacity", "1");
  expect(await footer.evaluate((el) => el.getAnimations().length)).toBe(0);
});
test("keyboard focus exposes an unrevealed accordion immediately", async ({
  page,
}) => {
  await installBuiltApp(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const project = page.locator(".project").last();
  await expect(project).toHaveAttribute("data-scroll-reveal", "pending");
  await project.locator("summary").focus();
  await expect(project).not.toHaveAttribute("data-scroll-reveal", "pending");
  await expect(project).toHaveCSS("opacity", "1");
});
