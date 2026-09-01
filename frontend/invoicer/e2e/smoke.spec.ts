import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const hasCredentials = Boolean(email && password);

test.describe("public pages", () => {
  test("landing page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /prisijungti|sign in/i }).first()).toBeVisible();
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /sveiki sugrįžę|welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/el\. paštas|email/i)).toBeVisible();
    await expect(page.getByLabel(/slaptažodis|password/i).first()).toBeVisible();
  });

  test("guest language switcher persists EN", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("banner").getByRole("button", { name: /^EN$/i }).click();
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
    await page.reload();
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
  });
});

test.describe("authenticated smoke", () => {
  test.skip(!hasCredentials, "Set E2E_EMAIL and E2E_PASSWORD for local/dev authenticated flows.");

  test("login, dashboard, clients, invoices", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/el\. paštas|email/i).fill(email as string);
    await page.getByLabel(/slaptažodis|password/i).first().fill(password as string);
    await page.getByRole("button", { name: /prisijungti|sign in/i }).click();
    await page.waitForURL(/\/dashboard/);
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/clients");
    await expect(page.getByRole("heading", { name: /klientai|clients/i })).toBeVisible();

    await page.goto("/invoices");
    await expect(page.getByRole("heading", { name: /sąskaitos|invoices/i })).toBeVisible();
  });
});
