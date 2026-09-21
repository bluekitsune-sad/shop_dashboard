import { expect, test } from "@playwright/test";

test("unlocks the dashboard with the shop PIN and navigates", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Shop Dashboard" })).toBeVisible();
  await page.getByLabel("PIN").fill("1234");
  await page.getByRole("button", { name: "Unlock Dashboard" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Inventory" }).click();
  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
});