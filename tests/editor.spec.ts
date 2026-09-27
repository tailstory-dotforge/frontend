import { expect, type Page, test } from "@playwright/test";

const SAMPLE_TEXT = "Hello Dotforge";

function sampleElement(page: Page) {
  return page.getByRole("button", { name: `Text element: ${SAMPLE_TEXT}` });
}

function paper(page: Page) {
  return page.getByTestId("artboard-paper");
}

function propertiesPanel(page: Page) {
  return page.getByRole("group", { name: "Text properties" });
}

async function openMenu(page: Page) {
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("menu", { name: "Main menu" })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // Astro strips the `ssr` attribute from an island once it hydrates.
  // Interacting with the server-rendered DOM before that loses the events.
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll("astro-island")).every(
      (island) => !island.hasAttribute("ssr"),
    ),
  );
});

test("selecting an element opens the properties panel", async ({ page }) => {
  await sampleElement(page).click();
  await expect(propertiesPanel(page)).toBeVisible();
});

test("clicking empty canvas deselects", async ({ page }) => {
  await sampleElement(page).click();
  await expect(propertiesPanel(page)).toBeVisible();
  await paper(page).click({ position: { x: 5, y: 5 } });
  await expect(propertiesPanel(page)).not.toBeVisible();
});

test("text tool places an element that stays selected", async ({ page }) => {
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await paper(page).click({ position: { x: 150, y: 200 } });

  await expect(
    page.getByRole("button", { name: "Text element: Text" }),
  ).toBeVisible();
  // Regression: the click used to bubble to the canvas and immediately
  // deselect the new element, so the properties panel never opened.
  await expect(propertiesPanel(page)).toBeVisible();
  // The tool switches back to select after placing.
  await expect(
    page.getByRole("button", { name: "Select", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("text tool works on top of an existing element", async ({ page }) => {
  await page.getByRole("button", { name: "Text", exact: true }).click();
  // Regression: clicks landing on an existing element were swallowed.
  await sampleElement(page).click();
  await expect(
    page.getByRole("button", { name: "Text element: Text" }),
  ).toBeVisible();
});

test("editing text updates the artboard", async ({ page }) => {
  await sampleElement(page).click();
  await page.getByRole("textbox", { name: "Text" }).fill("Updated label");
  await expect(
    page.getByRole("button", { name: "Text element: Updated label" }),
  ).toBeVisible();
});

test("editing font size updates the element", async ({ page }) => {
  await sampleElement(page).click();
  await page.getByRole("spinbutton", { name: "Font size" }).fill("6");
  await expect(sampleElement(page)).toHaveAttribute("style", /font-size: 6mm/);
});

test("delete button removes the selected element", async ({ page }) => {
  await sampleElement(page).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(sampleElement(page)).not.toBeVisible();
});

test("delete key removes the selected element", async ({ page }) => {
  await sampleElement(page).click();
  // Wait for the selection to render; the window keydown listener is
  // (re-)registered in an effect that flushes with the next frame.
  await expect(propertiesPanel(page)).toBeVisible();
  await page.keyboard.press("Delete");
  await expect(sampleElement(page)).not.toBeVisible();
});

test("dragging moves an element", async ({ page }) => {
  const el = sampleElement(page);
  const before = await el.evaluate((node) => node.style.left);
  const box = await el.boundingBox();
  if (!box) throw new Error("element has no bounding box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 60,
    box.y + box.height / 2 + 40,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect
    .poll(() => el.evaluate((node) => node.style.left))
    .not.toBe(before);
});

test("right-click neither selects nor drags an element", async ({ page }) => {
  const el = sampleElement(page);
  const before = await el.evaluate((node) => node.style.left);
  const box = await el.boundingBox();
  if (!box) throw new Error("element has no bounding box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2);
  await page.mouse.up({ button: "right" });
  await expect(propertiesPanel(page)).not.toBeVisible();
  expect(await el.evaluate((node) => node.style.left)).toBe(before);
});

test("dragging past the edge keeps the element inside the paper", async ({
  page,
}) => {
  const el = sampleElement(page);
  const box = await el.boundingBox();
  if (!box) throw new Error("element has no bounding box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  // Way past the right/bottom edge of the 100x150mm paper.
  await page.mouse.move(box.x + 2000, box.y + 2000, { steps: 5 });
  await page.mouse.up();
  const left = await el.evaluate((node) => Number.parseFloat(node.style.left));
  const top = await el.evaluate((node) => Number.parseFloat(node.style.top));
  expect(left).toBeLessThan(100);
  expect(top).toBeLessThan(150);
});

test("arrow keys nudge a focused element", async ({ page }) => {
  const el = sampleElement(page);
  await el.focus();
  await page.keyboard.press("Enter"); // select via keyboard
  await expect(propertiesPanel(page)).toBeVisible();
  // Sample element starts at x=5mm; one nudge moves it 1mm right.
  await page.keyboard.press("ArrowRight");
  await expect(el).toHaveAttribute("style", /left: 6mm/);
  await page.keyboard.press("Escape");
  await expect(propertiesPanel(page)).not.toBeVisible();
});

test("W/H inputs resize the artboard", async ({ page }) => {
  await page.getByRole("spinbutton", { name: "W mm" }).fill("120");
  await expect(paper(page)).toHaveAttribute("style", /width: 120mm/);

  await page.getByRole("spinbutton", { name: "H mm" }).fill("90");
  await expect(paper(page)).toHaveAttribute("style", /height: 90mm/);
});

test("values below the input minimum are not committed", async ({ page }) => {
  // W has min=1; a sub-minimum value must not resize the artboard.
  // (\s* because the untouched SSR style attribute has no space.)
  await page.getByRole("spinbutton", { name: "W mm" }).fill("0.5");
  await expect(paper(page)).toHaveAttribute("style", /width:\s*100mm/);
});

test("download/upload round-trips the document", async ({ page }) => {
  // Edit first so the round-trip carries a change.
  await sampleElement(page).click();
  await page.getByRole("textbox", { name: "Text" }).fill("Round trip");

  const downloadPromise = page.waitForEvent("download");
  await openMenu(page);
  await page.getByRole("menuitem", { name: "Download .dotforge" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const fs = await import("node:fs/promises");
  const raw = await fs.readFile(path, "utf-8");
  const doc = JSON.parse(raw);
  expect(doc.width).toBe(100);
  expect(doc.height).toBe(150);
  expect(doc.elements).toHaveLength(1);
  expect(doc.elements[0].text).toBe("Round trip");

  // Re-upload the same file and confirm the document loads.
  await page.locator('input[type="file"]').setInputFiles({
    name: "roundtrip.dotforge",
    mimeType: "application/json",
    buffer: Buffer.from(raw),
  });
  await expect(
    page.getByRole("button", { name: "Text element: Round trip" }),
  ).toBeVisible();
});

test("malformed upload shows an error and keeps the editor alive", async ({
  page,
}) => {
  const dialogPromise = page.waitForEvent("dialog");
  await page.locator('input[type="file"]').setInputFiles({
    name: "broken.dotforge",
    mimeType: "application/json",
    buffer: Buffer.from('{"width":10,"height":10,"elements":[null]}'),
  });
  const dialog = await dialogPromise;
  expect(dialog.message()).toContain("Failed to load .dotforge file");
  await dialog.accept();
  // The previous document is still rendered and interactive.
  await sampleElement(page).click();
  await expect(propertiesPanel(page)).toBeVisible();
});

test("theme selection applies and persists across reload", async ({ page }) => {
  await openMenu(page);
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/theme-dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/theme-dark/);
});

test("garbage stored theme falls back to a valid theme", async ({ page }) => {
  // "toString" exercises the prototype-chain hole: a plain `in` /
  // truthy-lookup check would accept it as a theme id.
  for (const garbage of ["definitely-not-a-theme", "toString", "__proto__"]) {
    await page.evaluate((value) => {
      localStorage.setItem("dotforge-theme", value);
    }, garbage);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/theme-(light|dark)$/);
  }
});

test("text tool shows a placement hint", async ({ page }) => {
  const hint = page.getByText("Click the page to place text");
  await expect(hint).not.toBeVisible();
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await expect(hint).toBeVisible();
  await page.getByRole("button", { name: "Select", exact: true }).click();
  await expect(hint).not.toBeVisible();
});

test("main menu is keyboard operable", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Menu" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  // Opening focuses the first item; arrows move through the rest.
  await expect(page.getByRole("menuitem", { name: "Open…" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitem", { name: "Download .dotforge" }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("menuitem", { name: "Artboard" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu", { name: "Main menu" })).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test("keys pressed in the menu leave the selection alone", async ({ page }) => {
  await sampleElement(page).click();
  await expect(propertiesPanel(page)).toBeVisible();
  await openMenu(page);
  // Neither reaches the editor's window shortcuts while the menu has focus.
  await page.keyboard.press("Delete");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu", { name: "Main menu" })).not.toBeVisible();
  await expect(sampleElement(page)).toBeVisible();
  await expect(propertiesPanel(page)).toBeVisible();
});

test("clicking outside the menu closes it", async ({ page }) => {
  await openMenu(page);
  await paper(page).click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole("menu", { name: "Main menu" })).not.toBeVisible();
});
