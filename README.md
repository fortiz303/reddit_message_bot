# 1. How to start:

- create new folder (for example "app");
- go to the created folder ("app" folder);
- clone repo to the new folder:
  "git clone https://github.com/fortiz303/reddit_message_bot.git"
  (result: [app]/[reddit_message_bot])
- go to the to the root of the cloned folder (/app/reddit_message_bot);
- create an .env file in the root of cloned folder (near /src folder) with the following keys (reddit account credentials):

  EMAIL=

  PASSWORD=

- set the required start date in the config file: '/src/config.js', key:"startDate"
- change message if needed, '/src/config.js', key:"message"
- run command docker compose build;
- run command docker compose up;

# Project tree

- [app]
  - [reddit_message_bot]
    - [screenshots]
    - [src]
      - [classes]
      - index.js
      - ...
    - Dockerfile
    - [README.md]
    - .env
    - ...
  - [out]-(will be created automatically)

# 2. "[src]/config.js":

- **"message"** : Message to send to the lender;
- **"startDate"** : The start date of post collection (not included), the posts with publish date after the start date will be included (for the first iteration, two days before the first launch of the script is enough);
- **"timeToTheNextItteration"** : time to the next itteration in hours, by default - 24h (once a day);

# 3. "[app]/[out]":

Folder will be created automatically after first launch of the docker container;
This folder contains latest processed post data for the next itetration as well as a list of processed lenders - **DON'T** delete. Excluded from the git workflow.

Future updates should be pulled to the [cloned-folder], [out] folder with existing data will be connected to the docker container as a volume.

# 4. "Errors":

If errors occur, the script will restart automatically
