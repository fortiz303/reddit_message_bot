FROM node:20.18

# Install necessary dependencies for Puppeteer and Chromium
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    apt-transport-https \
    software-properties-common \
    wget \
    dbus-x11 \
    xvfb \
    ffmpeg \
    xauth \
    vim-common \
    libnss3 \
    libxss1 \
    libpulse0 \
    libasound2 \
    libasound2-plugins \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-glib-1-2 \
    libgbm1 \
    libxkbcommon-x11-0 \
    libgtk-3-0 \
    && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /reddit/app
COPY ./package.json ./


RUN npm install
USER root
RUN  npx puppeteer browsers install chrome --install-deps
COPY . .
ENV DISPLAY=:99
ENV XAUTHORITY=/root/.Xauthority
COPY startup.sh /reddit/app/startup.sh
RUN chmod +x /reddit/app/startup.sh

CMD ["/reddit/app/startup.sh"]