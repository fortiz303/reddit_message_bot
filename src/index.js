import dotenv from "dotenv";
const envs = dotenv.config();

const IS_SLICED = false;

import { writeFile } from "node:fs/promises";

import { getConfig } from "./config.js";

import { delay, getDateString } from "./utils.js";

import { Browser, User, CustomePage, FileHandler } from "./classes/index.js";

const config = getConfig(envs.parsed);

let loginErrorCount = 0;

const main = async () => {
  const browserObj = new Browser(config);
  const browser = await browserObj.launch();
  const initialPage = await browserObj.initPage();

  await initialPage.setUserAgent(config.userAgent);
  const page = new CustomePage(initialPage, config);

  const user = new User(initialPage);

  const dateString = getDateString();

  await page.goToTheMainPage();

  // Check if user already logged in

  const isUserLoggedIn = await user.getIsUserLoggegIn();

  if (!isUserLoggedIn) {
    // Processing log in
    console.log("Open login modal");
    await page.openLoginModal();

    await user.login();
  }

  try {
    await delay(500);

    console.log("Check for login server error");

    await delay(3000);
    const isLogginError = await page.checkForLoginError();

    if (isLogginError) {
      console.log("Login server error");
      await page.makeErrorScreenshot(dateString);

      console.log("Close browser");
      await browser.close();

      if (loginErrorCount > 2) {
        loginErrorCount = 0;
        await FileHandler.cleanTempBrowserDir();
      } else loginErrorCount++;

      setTimeout(() => {
        main();
      }, 10000);
    } else {
      console.log("Loading dashboard");
      await delay(3000);

      await user.navigateToTheThread();

      loginErrorCount = 0;

      await user.selectCompletedPosts();

      try {
        // Inject date compare function to the webpage context
        await page.exposeFunction();

        let posts, postsData;

        //   Get latest handled post data
        let parsedInitialData = await FileHandler.getLatestPostData(config);

        if (parsedInitialData) {
          // Envoke function to get posts data with latest post data
          postsData = await page.getPostsData(parsedInitialData);
        } else {
          // Envoke function to get posts data with start date
          postsData = await page.getPostsData();
        }
        posts = postsData.posts;
        parsedInitialData = { latesPost: posts[0] };

        // Handle posts
        console.log("Collected " + posts.length + " posts.");
        posts = IS_SLICED ? posts.slice(0, 3) : posts;
        console.log(posts.length + " posts for handling.");

        if (posts.length) {
          console.log("Writing the latest posts to posts.json");
          await writeFile("../out/posts.json", JSON.stringify(posts), {
            encoding: "utf-8",
          });

          for (let post of posts.reverse()) {
            let existedLenders = [];
            const date = getDateString();

            //   Scroll current post into view
            await page.scrollCurrentPostToTheTop(post.permalink);

            console.log("");
            console.log("===========================");
            console.log("");

            console.log("Handling post: ", post.title);

            const latestPostData = await FileHandler.getLatestPostData(
              config,
              "Getting a list of already processed lenders "
            );
            existedLenders = latestPostData?.lenders || [];

            await user.goToTheCurrentPost(post.permalink);

            let currentLender;

            try {
              await delay(7000);
              if (existedLenders) {
                currentLender = await user.getCurrentLenderUsername(
                  existedLenders
                );
              }

              if (!currentLender) {
                await FileHandler.writeLatestData(post, existedLenders);
                await page.goBack();
                continue;
              } else {
                console.log("Go to the lender profile");
                await user.goToTheLenderProfile();
                await delay(7000);
              }
            } catch (e) {
              console.log("[ERROR]-Go to the lender profile- ", e.message);
              await page.goBack();
              continue;
            }

            const chatButton = await page.checkForChatButton();

            if (!chatButton) {
              console.log(
                "Chat button is disabled. Go back to the posts list "
              );

              await FileHandler.writeLatestData(post, existedLenders);

              await page.goFromProfileToThePostsList();
              await delay(2000);
              continue;
            }

            try {
              console.log("Open chat");
              await user.openChat();

              console.log("Typing a message: ", config.message);
              await user.typeMessage(config.message);

              console.log("Sending message");
              await delay(2000);
              await user.sendMessage();

              console.log("Result screenshot");
              await page.makeResultScreenshot(currentLender, date);

              console.log("Closing the chat");
              await user.closeChat();

              console.log("Writing the latest data to latestPost.json");
              await FileHandler.writeLatestData(post, [
                ...existedLenders,
                currentLender,
              ]);

              await page.goFromProfileToThePostsList();
            } catch (e) {
              console.log("[ERROR]-Chat error- ", e.message);
            }
          }
        }

        await user.logout();

        console.log("Close browser");
        await browser.close();

        console.log(
          `The next itteration in: ${config.timeToTheNextItteration} hours`
        );
        setTimeout(async () => {
          await main();
        }, 1000 * 60 * 60 * config.timeToTheNextItteration);
      } catch (e) {
        console.log("[ERROR]-Main error- ", e);

        await user.logout();

        console.log("Close browser");
        await browser.close();

        await main();
      }
    }
  } catch (e) {
    if (page) {
      console.error(e);
      await page.makeErrorScreenshot(dateString);
    }
    await user.logout();

    await main();
  }
};

await main();
