FROM node:18-slim

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

# Install bash and nvm as convenience
RUN apt-get install bash
RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
# Copies your code file from your action repository to the filesystem path `/` of the container
COPY entrypoint.sh /stark_ga/entrypoint.sh
COPY dist /stark_ga/dist

# Install stark accessibility cli
RUN npm i -g @stark-test/accessibility-cli@0.7.1-bump-ruleengine.0 \
  && stark-accessibility --version

# TODO: symlink /root/.local-chromium to $GITHUB_HOME/.local-chromium to avoid double install or remove install from this step.
# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["/stark_ga/entrypoint.sh"]