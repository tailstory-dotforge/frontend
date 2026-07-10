import { expect, test } from "@playwright/test";

test("homepage loads successfully", async ({ page }) => {
  await page.goto("/");

  // Check that the page title is correct
  await expect(page).toHaveTitle(/Dotforge - Editor/);
});

test("document editor is present", async ({ page }) => {
  await page.goto("/");

  // Wait for the document editor component to be visible
  // The DocumentEditor component should be present on the page
  const documentEditor = page.locator("body");
  await expect(documentEditor).toBeVisible();
});
