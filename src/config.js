export const getConfig = (envs) => ({
  browser: {
    headless: false,
    executablePath:
      process.env.NODE_ENV === "production"
        ? "/root/.cache/puppeteer/chrome/linux-131.0.6778.204/chrome-linux64/chrome"
        : envs?.DEV_CHROME_PATH,
    userDataDir: "/tmp/browser",
    args: [
      "--enable-gpu",
      "--disable-blink-features=AutomationControlled",
      `--window-size=${1400},${768}`,
      "--no-sandbox",
    ],
    defaultViewport: null,
    ignoreDefaultArgs: ["--enable-automation"],
  },
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  // Change the message if needed
  message:
    "Hey! We offer our lenders $20 for every loan they grant on our platform, download our app on the store 'Loanr' and would love to talk to you more about that if you reply to this message with your phone number. Thanks and have a blessed day!",
  // Date to start collect posts, the posts with publish date after start date will be included
  startDate: "2025-01-30",
  timeToTheNextItteration: 24, //in hours
});
