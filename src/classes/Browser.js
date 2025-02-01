import puppeteer from "puppeteer";

export class Browser {
  constructor(config) {
    this.config = config;
  }

  async launch() {
    this.browser = await puppeteer.launch({
      ...this.config.browser,
    });

    console.log("Browser created");

    return this.browser;
  }

  async initPage() {
    return await this.browser.newPage();
  }
}
