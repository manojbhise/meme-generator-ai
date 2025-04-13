import { Page, Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

/**
 * 🤘 Welcome to Stagehand! Thanks so much for trying us out!
 * 🛠️ CONFIGURATION: stagehand.config.ts will help you configure Stagehand
 *
 * 📝 Check out our docs for more fun use cases, like building agents
 * https://docs.stagehand.dev/
 *
 * 💬 If you have any feedback, reach out to us on Slack!
 * https://stagehand.dev/slack
 *
 * 📚 You might also benefit from the docs for Zod, Browserbase, and Playwright:
 * - https://zod.dev/
 * - https://docs.browserbase.com/
 * - https://playwright.dev/docs/intro
 */

export async function main({
  page,
  stagehand,
}: {
  page: Page; // Playwright Page with act, extract, and observe methods
  stagehand: Stagehand; // Stagehand instance
}) {
  console.log("Starting Chart meme generation...");
  await stagehand.page.goto("https://imgflip.com/chart-maker", {
    waitUntil: "domcontentloaded",
  });
  try {
    // Selecting donut chart type...
    await page.act({
      action: 'Click the "Donut" chart type button',
    });
    // Setting a chart title
    const title = "Title 1";
    await page.act({
      action: `Enter the text as "${title}" in the input box containing "Chart Title" placeholder`,
    });
    // Generating and filling in captions
    const { res1, res2 } = await page.extract({
      instruction: `Bases on the message "${title}", generate two short, humerous responses which will be used for a chart meme - Response 1 will be 1% of the activity and response 2 will be 99% of activity based on "${title}"`,
      schema: z.object({
        res1: z.string(),
        res2: z.string(),
      }),
    });
    console.log(res1, res2);

    const [action1] = await page.observe(
      `Locate the input box with the placeholder "slice #1"`
    );
    const [action2] = await page.observe(
      `Locate the input box with the placeholder "slice #2"`
    );
    console.log(action1, action2);
    await page.act({ ...action1, arguments: [res2] });
    await page.act({ ...action2, arguments: [res1] });
    await page.act({ action: 'Click the "Make Chart" button' });
    // Wait for the input field to appear
    await page.waitForSelector("input.img-code.link", { timeout: 10000 });
    const imgUrlTag = await page.locator("input.img-code.html").inputValue();
    // Remove png from imgUrlTag
    const imageUrl = imgUrlTag.match(/src="([^"]+)"/);
    const directImageUrl = imageUrl?.[1] ?? null;
    if (!directImageUrl) {
      console.error("Failed to extract image url");
      return;
    }
    await page.goto(directImageUrl);
    const downloadPath = "./downloads/downloaded-chart.png";
    await page.screenshot({ path: downloadPath });

    console.log("Image downloaded successfully!");
  } catch (error) {
    console.error("Error during chart meme generation");
    process.exit(1);
  }
}
