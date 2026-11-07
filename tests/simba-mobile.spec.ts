import { expect, test } from "@playwright/test";
import { installBuiltApp } from "./fixtures/built-app";
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
test("Simba moves on touchscreens and respects reduced motion", async ({
  page,
}) => {
  await installBuiltApp(page);
  await page.goto("/");
  await expect
    .poll(() => page.evaluate(() => matchMedia("(pointer: coarse)").matches))
    .toBe(true);
  const head = page.locator(".simba-head");
  await page.locator(".portrait").scrollIntoViewIfNeeded();
  await expect
    .poll(() => head.evaluate((el) => el.style.transform))
    .not.toBe("");
  const first = await head.evaluate((el) => el.style.transform);
  await expect
    .poll(() => head.evaluate((el) => el.style.transform))
    .not.toBe(first);
  const bounds = await head.boundingBox();
  await page.touchscreen.tap(
    bounds!.x + bounds!.width * 0.2,
    bounds!.y + bounds!.height * 0.5,
  );
  const touched = await head.evaluate((el) => el.style.transform);
  await expect
    .poll(() => head.evaluate((el) => el.style.transform))
    .not.toBe(touched);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(head).toHaveCSS("transform", "none");
});
