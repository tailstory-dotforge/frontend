import { expect, test } from "@playwright/test";

test("homepage loads successfully", async ({ page }) => {
  await page.goto("/");

  // Check that the page title is correct
  await expect(page).toHaveTitle(/Dotforge - Editor/);
});

test("document editor is present", async ({ page }) => {
  await page.goto("/");

  // The file toolbar and the rendered sample document prove the
  // DocumentEditor component actually mounted
  await expect(
    page.getByRole("button", { name: "Download .dotforge" }),
  ).toBeVisible();
  await expect(page.getByText("Hello Dotforge", { exact: true })).toBeVisible();
});
