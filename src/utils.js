import { exec } from "node:child_process";

export const delay = (time) =>
  new Promise(function (resolve) {
    setTimeout(resolve, time);
  });

export const getDateString = () => {
  const date = new Date();

  return (
    date.getDate() +
    "-" +
    (date.getMonth() + 1) +
    "-" +
    date.getFullYear() +
    "-" +
    date.getHours() +
    ":" +
    date.getMinutes()
  );
};

export const clean = () => exec("rm /tmp/.X99-lock");

export const checkIsSartedDatePassed = (startDate, createdDate) => {
  const requiredDate = new Date(startDate).setHours(0, 0, 0, 0);

  var lastPostDate = new Date(createdDate).setHours(0, 0, 0, 0);

  return lastPostDate < requiredDate;
};

// Collect posts data
export const getPostsData = async (page, startDate, data, found) => {
  const { latestPost, lenders = [] } = data || {};

  // Wait for posts wrapper selector
  await page.waitForSelector("shreddit-feed faceplate-batch", {
    visible: true,
  });

  //   If latest post exists, start date will be equal to its publish date
  const currentStartDate = latestPost?.publishDate || startDate;

  // Get post from the page
  const result = await page.evaluate(
    async (startDate, found) => {
      // Get all posts
      const elements = Array.from(
        document.querySelectorAll("shreddit-feed article shreddit-post")
      );

      if (!found) {
        // Get last post publish date
        const lastPostCreatedDate =
          elements[elements.length - 1].attributes[
            "created-timestamp"
          ].nodeValue.split("T")[0];

        // Check if the last post publish date is earlier then required
        const isStartDayPassed = await checkIsSartedDatePassed(
          startDate,
          lastPostCreatedDate
        );

        if (!isStartDayPassed) {
          // If not - return body height to scroll to get more posts
          return {
            message: "scroll",
            scrollHeight: document.body.scrollHeight,
          };
        } else if (isStartDayPassed && !found) {
          // If required date found return body height to scroll to the top
          return {
            message: "found",
            scrollHeight: document.body.scrollHeight,
          };
        }
      } else {
        // Return posts
        const permalinks = elements.map(({ attributes }) => {
          return {
            permalink: attributes.permalink.nodeValue,
            publishDate:
              attributes["created-timestamp"].nodeValue.split("T")[0],
            title: attributes["post-title"].nodeValue.toLowerCase(),
          };
        });

        return {
          message: "finish",
          permalinks,
        };
      }
    },
    currentStartDate,
    found
  );

  if (result.message === "scroll") {
    // Scroll page go get lazy data
    console.log("Scroll page");
    await page.mouse.wheel({ deltaX: 0, deltaY: result.scrollHeight });
    await delay(2000);
    page.waitForResponse((resp) => resp.ok());
    return await getPostsData(page, startDate, data, found);
  } else if (result.message === "found") {
    // Scroll page to the top
    console.log("Success");
    await page.mouse.wheel({ deltaX: 0, deltaY: -result.scrollHeight });
    page.waitForResponse((resp) => resp.ok());
    await delay(2000);
    return await getPostsData(page, startDate, data, true);
  } else {
    // Prepare post to return
    let startDatePostIndex;
    // If latest post exists, find its index in the post array
    if (latestPost?.permalink) {
      startDatePostIndex = result.permalinks.findIndex(
        ({ permalink }) => permalink === latestPost.permalink
      );
    } else {
      // If latest post doesn't exist find first post with start date
      startDatePostIndex = result.permalinks.findIndex(({ publishDate }) =>
        publishDate.includes(startDate)
      );
    }

    // Get all post before previous index, we will get latest posts

    const filteredPosts = result.permalinks
      .slice(0, startDatePostIndex)
      .filter(({ title }) => {
        if (!!title.match(/(us|united states)/) && title.includes("req"))
          return true;
        else return false;
      });

    return { posts: filteredPosts };
  }
};
