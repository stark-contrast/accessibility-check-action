FROM node:16-slim

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /stark_ga/entrypoint.sh
COPY dist /stark_ga/dist
COPY blobs/stark-accessibility-cli-0.2.0-beta.0.tgz /stark_ga/stark-accessibility-cli-0.2.0-beta.0.tgz

# Install stark accessibility cli
RUN npm i -g /stark_ga/stark-accessibility-cli-0.2.0-beta.0.tgz \
    && stark-accessibility --version

# TODO: symlink /root/.local-chromium to $GITHUB_HOME/.local-chromium to avoid double install or remove install from this step.
# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/stark_ga/entrypoint.sh"]