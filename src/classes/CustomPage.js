import {
  checkIsSartedDatePassed,
  getPostsData as getPostsDataUtil,
} from "../utils.js";

export class CustomePage {
  page;
  config;
  constructor(initialPage, config) {
    this.config = config;
    this.page = initialPage;
  }

  async goToTheMainPage() {
    console.log("Navigate to https://www.reddit.com");
    await this.page.goto("https://reddit.com", {
      waitUntil: "domcontentloaded",
    });
    console.log("Navigated to https://www.reddit.com successfully");
  }

  async openLoginModal() {
    await this.page.waitForSelector(">>> #login-button", { visible: true });

    const [response] = await Promise.all([
      this.page.waitForNetworkIdle({ idleTime: 3000 }),
      this.page.click(">>> #login-button"),
    ]);
  }

  async goBack() {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: "load" }),
      this.page.goBack(),
    ]);
  }

  async checkForLoginError() {
    const serverError = await this.page.$$("::-p-text(Please try again)");

    return Boolean(serverError?.length);
  }

  async scrollCurrentPostToTheTop(permalink) {
    await this.page.evaluate((permalink) => {
      window.scrollTo(0, 0);

      const post = document.querySelector(`[permalink="${permalink}"]`);
      if (post) {
        post.scrollIntoView({ behavior: "smooth" });
      }
    }, permalink);
  }

  async checkForChatButton() {
    console.log("Check for chat button");
    const chatButton = await this.page.$$(">>> reddit-chat-anchor > a");

    return chatButton[0];
  }

  async goFromProfileToThePostsList() {
    await this.goBack();
    await this.goBack();
  }

  async makeResultScreenshot(currentLender, date) {
    await this.page.screenshot({
      path: `screenshots/final-${currentLender}-${date}.png`,
    });
  }
  async makeErrorScreenshot(date) {
    await this.page.screenshot({
      fullPage: true,
      path: `screenshots/error-${date}.png`,
    });
  }

  async exposeFunction() {
    await this.page.exposeFunction(
      "checkIsSartedDatePassed",
      checkIsSartedDatePassed
    );
  }

  async getPostsData(parsedInitialData) {
    const postsData = await getPostsDataUtil(
      this.page,
      this.config.startDate,
      parsedInitialData
    );

    return postsData;
  }
}
