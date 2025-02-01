import { clean, delay } from "../utils.js";

export class User {
  constructor(page) {
    this.page = page;
  }

  async login() {
    console.log("Type username");
    await this.page.waitForSelector('>>> [name="username"]', { visible: true });
    await this.page.click('>>> [name="username"]');
    await this.page.keyboard.type(process.env.EMAIL, { delay: 80 });
    await delay(1000);

    console.log("Type password");
    await this.page.waitForSelector('>>> [name="password"]', { visible: true });
    await this.page.click('>>> [name="password"]');
    await this.page.keyboard.type(process.env.PASSWORD, { delay: 95 });
    await delay(1500);

    console.log("Logging in");

    await Promise.all([
      this.page.waitForResponse((resp) => resp.ok()),
      this.page.click(">>> .login"),
    ]);
  }

  async logout() {
    console.log("Log out");
    const accountMenu = await this.page.$$("#expand-user-drawer-button");

    if (accountMenu.length) {
      await this.page.click("#expand-user-drawer-button");
      await delay(1500);

      await Promise.all([
        this.page.waitForNavigation("load"),
        this.page.click("#logout-list-item"),
      ]);
    }

    console.log("Cleaning");
    clean();
  }

  async navigateToTheThread() {
    console.log("Search the thread");
    await this.page.waitForSelector(">>> reddit-search-large", {
      timeout: 3000,
    });
    await this.page.locator(">>> reddit-search-large").click();
    await this.page.keyboard.type("borrow", { delay: 85 });
    await delay(2000);

    console.log("Go to the thread");
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: "load" }),
      this.page.click('pierce/[href="/r/borrow/"]'),
    ]);
    await delay(3000);
  }

  async selectCompletedPosts() {
    await this.page.waitForSelector("a ::-p-text(Completed)", {
      visible: true,
    });

    //   Select all posts wih "Completed" tag
    const [response] = await Promise.all([
      this.page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      this.page.click("a ::-p-text(Completed)"),
    ]);
    await delay(2000);
  }

  async getIsUserLoggegIn() {
    const loginButton = await this.page.$$(">>> #login-button");

    return !Boolean(loginButton?.length);
  }

  async goToTheCurrentPost(permalink) {
    console.log("Go to the post page");
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      this.page.click(`[permalink="${permalink}"]`),
    ]);
  }

  async getCurrentLenderUsername(existedLenders) {
    const requiredString = await this.page.$$("::-p-text($loan)");

    if (!requiredString.length) {
      return null;
    }

    const lenderUsername = await this.page.evaluate(() => {
      let currentLenderUsername;
      const els = document.querySelectorAll("#-post-rtjson-content");

      els.forEach((el) => {
        Array.from(el.children || []).forEach((c) => {
          if (c.innerText.includes("$loan")) {
            const parent = el.parentNode.parentNode.children[1];
            const profileLink = parent.querySelector("faceplate-hovercard a");
            currentLenderUsername = profileLink.innerText;
          }
        });
      });
      return currentLenderUsername;
    });

    if (existedLenders.includes(lenderUsername)) {
      console.log("The message has already been sent to the current lender");
      return null;
    } else {
      return lenderUsername;
    }
  }

  async goToTheLenderProfile() {
    await this.page.evaluate(() => {
      // Go to the lender profile if it wasn't handled before
      const els = document.querySelectorAll("#-post-rtjson-content");

      els.forEach((el) => {
        Array.from(el.children || []).forEach((c) => {
          if (c.innerText.includes("$loan")) {
            const parent = el.parentNode.parentNode.children[1];
            const profileLink = parent.querySelector("faceplate-hovercard a");

            profileLink.click();
          }
        });
      });
    });
  }

  async openChat() {
    await this.page.locator(">>> reddit-chat-anchor > a").click();
    await delay(1000);
  }

  async typeMessage(message) {
    await this.page.waitForSelector('>>> textarea[name="message"]', {
      timeout: 3000,
    });
    await this.page.locator('>>> textarea[name="message"]').click();
    await delay(500);
    await this.page.keyboard.type(message, { delay: 150 });
    await delay(2500);
  }

  async sendMessage() {
    console.log("Send message");
    await this.page.locator('>>> button[aria-label="Send message"]').click();
    await delay(5000);
  }

  async closeChat() {
    await this.page.locator('>>> button[aria-label="Close chat"]').click();
    await delay(7000);
  }
}
