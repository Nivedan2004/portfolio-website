import { expect, test } from "@playwright/test";
import { installBuiltApp } from "./fixtures/built-app";
test("closing animates through intermediate heights and supports reversing direction", async ({
  page,
}) => {
  await installBuiltApp(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const entry = page.locator(".entry").first();
  const summary = entry.locator("summary");
  await summary.scrollIntoViewIfNeeded();
  const closed = (await entry.boundingBox())!.height;
  await summary.click();
  await expect(entry).toHaveAttribute("open", "");
  await expect(entry).not.toHaveAttribute("data-animating", "true");
  const expanded = (await entry.boundingBox())!.height;
  expect(expanded).toBeGreaterThan(closed + 100);
  await summary.click();
  await expect(entry).toHaveAttribute("data-animating", "true");
  // Sample while the animation is running, rather than just checking an animation name.
  const middle = await entry.evaluate(async (el) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return el.getBoundingClientRect().height;
  });
  expect(middle).toBeLessThan(expanded);
  expect(middle).toBeGreaterThan(closed);
  await summary.click();
  await expect(entry).toHaveAttribute("open", "");
  await expect(entry).not.toHaveAttribute("data-animating", "true");
  expect((await entry.boundingBox())!.height).toBeGreaterThan(closed + 100);
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(entry).not.toHaveAttribute("open", "");
  expect(Math.abs((await entry.boundingBox())!.height - closed)).toBeLessThan(
    2,
  );
});
test("reduced motion closes immediately without height animation", async ({
  page,
}) => {
  await installBuiltApp(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const entry = page.locator(".project").first();
  await entry.locator("summary").click();
  await expect(entry).toHaveAttribute("open", "");
  await entry.locator("summary").click();
  await expect(entry).not.toHaveAttribute("open", "");
  expect(await entry.evaluate((el) => el.getAnimations().length)).toBe(0);
});
