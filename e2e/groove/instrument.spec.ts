/**
 * Groove is a Web Audio instrument, so these tests are deliberately shallow: they prove the
 * sequencer runs and the controls respond, never that it sounds right. Audio quality is a
 * manual check - see e2e/EXPLORATORY.md.
 *
 * The playhead LED is the honest proxy for "the clock is running": it is driven by the same
 * transport that schedules the audio, without reaching into the audio graph.
 */
import { test, expect } from "../fixtures";
import type { Page } from "@playwright/test";

declare global {
  interface Window {
    /** Every step index the LED strip has lit since recordSteps() was installed. */
    stepsSeen?: Set<number>;
  }
}

const UNITS = [/RHYTHM|ताल/, /BASS|बास/, /PADS|पैड/, /LEAD|लीड/];

/**
 * How many of a bar's 16 steps have to light before we accept that the sequencer ran.
 *
 * Not all 16. The engine's draw loop reports only the last step it finds queued each frame, so a
 * machine whose rAF drops below the step rate of 7.5/sec renders a bar with gaps in it. Measured
 * with CDP CPU throttling: every step still lights at a 30x slowdown (rAF 8fps, bar seen in 4.1s),
 * and 15 of 16 at 50x. Twelve keeps a wide margin on a slow laptop while still being impossible to
 * reach without sweeping most of a bar.
 */
const MIN_STEPS_SEEN = 12;

/** Index of the lit step in the master LED strip, or -1 when the transport is stopped. */
function playhead(page: Page): Promise<number> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll(".master-leds .led")).findIndex((el) =>
      el.className.includes("on"),
    ),
  );
}

const transport = (page: Page) =>
  page.getByRole("button", { name: /(PLAY|STOP|चलाएँ|रोकें)/ });

/**
 * Accumulates every step the LED strip lights, from inside the page.
 *
 * Sampling the strip from the test cannot do this reliably. `expect.poll` settles at a 1s
 * interval, a step lasts 134ms and a bar 2.14s, so each poll advances 7.47 steps and two polls
 * land a step short of a full bar: the samples walk backwards through the bar in a comb -
 * 12, 11, 10, 9 - which can miss steps 13 to 15 for an entire 10s window. That is what used to
 * fail this spec intermittently, and CPU load only moved the phase. A set that only ever grows
 * makes the poll interval irrelevant.
 */
async function recordSteps(page: Page) {
  await page.locator(".master-leds").waitFor();
  await page.evaluate(() => {
    const strip = document.querySelector(".master-leds")!;
    const seen = new Set<number>();
    window.stepsSeen = seen;
    const record = () => {
      const lit = Array.from(strip.querySelectorAll(".led")).findIndex((el) =>
        el.className.includes("on"),
      );
      if (lit >= 0) seen.add(lit);
    };
    new MutationObserver(record).observe(strip, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  });
}

const stepsSeen = (page: Page) =>
  page.evaluate(() => window.stepsSeen?.size ?? 0);

test("the instrument boots with all four units", async ({ page }) => {
  await page.goto("/groove/");
  for (const unit of UNITS) {
    await expect(page.getByRole("region", { name: unit })).toBeVisible();
  }
  await expect(transport(page)).toContainText(/PLAY|चलाएँ/);
});

test("the transport starts and stops, and the playhead follows it", async ({
  page,
}) => {
  await page.goto("/groove/");
  expect(await playhead(page)).toBe(-1);

  await transport(page).click();
  await expect(transport(page)).toContainText(/STOP|रोकें/);

  // The clock is running if a step lights at all, then moves on.
  await expect
    .poll(() => playhead(page), { timeout: 5000 })
    .toBeGreaterThanOrEqual(0);
  const first = await playhead(page);
  await expect.poll(() => playhead(page), { timeout: 5000 }).not.toBe(first);

  await transport(page).click();
  await expect(transport(page)).toContainText(/PLAY|चलाएँ/);
  await expect.poll(() => playhead(page), { timeout: 3000 }).toBe(-1);
});

test("drum steps are individually addressable and toggle through their states", async ({
  page,
}) => {
  await page.goto("/groove/");
  const step = page.getByRole("button", {
    name: /KICK (step|स्टेप) 3/i,
    exact: true,
  });
  await expect(step).toBeVisible();

  const before = await step.getAttribute("aria-pressed");
  await step.click();
  await expect(step).not.toHaveAttribute("aria-pressed", before!);
});

test("melodic steps carry their unit name so the four grids stay distinguishable", async ({
  page,
}) => {
  await page.goto("/groove/");
  for (const [en, hi] of [
    ["BASS", "बास"],
    ["PADS", "पैड"],
    ["LEAD", "लीड"],
  ]) {
    await expect(
      page.getByRole("button", {
        name: new RegExp(`^(${en}|${hi}) (step|स्टेप) 1$`, "i"),
        exact: true,
      }),
    ).toHaveCount(1);
  }
});

test("switching patches changes the tempo", async ({ page }) => {
  await page.goto("/groove/");
  const bpm = () =>
    // Bounded rather than `\d+`: a tempo is at most four digits, and an unbounded quantifier
    // scanning the whole document backtracks badly.
    page.evaluate(() => /(\d{1,4})BPM/.exec(document.body.textContent)?.[1]);

  const first = await bpm();
  await page.getByRole("button", { name: /BASALT/ }).click();
  await expect.poll(bpm, { timeout: 3000 }).not.toBe(first);
});

test("a unit can be muted and unmuted", async ({ page }) => {
  await page.goto("/groove/");
  const rhythm = page.getByRole("region", { name: /RHYTHM|ताल/ });
  await rhythm.getByRole("button", { name: /MUTE|म्यूट/ }).click();
  await expect(rhythm).toHaveClass(/muted/);
  await rhythm.getByRole("button", { name: /MUTE|म्यूट/ }).click();
  await expect(rhythm).not.toHaveClass(/muted/);
});

test("running the sequencer logs no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/groove/");
  await recordSteps(page);
  await transport(page).click();
  // Most of a bar has to light. The playhead is driven by the same transport that schedules the
  // audio, so a swept bar proves the sequencer really ran.
  await expect
    .poll(() => stepsSeen(page), { timeout: 10_000 })
    .toBeGreaterThanOrEqual(MIN_STEPS_SEEN);
  await transport(page).click();

  expect(errors).toEqual([]);
});
