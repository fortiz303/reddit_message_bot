import {
  writeFile,
  readFile,
  access,
  constants,
  rm,
  mkdir,
} from "node:fs/promises";

import { LATEST_DATA_FILEPATH } from "../constants.js";

export class FileHandler {
  static async cleanTempBrowserDir() {
    console.log("Clean temp dir");
    await rm("/tmp/browser", { recursive: true, force: true });
    await mkdir("/tmp/browser");
  }

  static async getLatestPostData(config, message) {
    try {
      // Check is latest post data file exists
      await access(LATEST_DATA_FILEPATH, constants.R_OK | constants.W_OK);

      //   Get latest handled post data
      const latestPostData = await readFile(LATEST_DATA_FILEPATH);
      const parsedLatestPostData = JSON.parse(latestPostData);

      if (message) {
        console.log(message);
      } else {
        console.log(
          "Latest post data exists. Collect after " +
            parsedLatestPostData.latestPost.publishDate
        );
      }
      return parsedLatestPostData;
    } catch (e) {
      console.error(
        "Latest post data doesn't exist. Collect after " +
          config.startDate +
          " " +
          e.message
      );
      return null;
    }
  }

  static writeLatestData = async (latestPost, lenders) => {
    await writeFile(
      LATEST_DATA_FILEPATH,
      JSON.stringify({
        latestPost,
        lenders,
      }),
      {
        encoding: "utf-8",
      }
    );
  };
}
