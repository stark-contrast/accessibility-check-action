# syntax=docker/dockerfile:1
# The above line is there to allow the secret to be mounted properly.

FROM node:20-slim

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

# We want the audit to live in its own directory, so that any build/serve/etc commands
# that are run from the container will operate on the code to test, not the audit code.

COPY entrypoint.sh package.json yarn.lock .npmrc tsconfig.json /stark_ga/

RUN --mount=type=secret,id=github-token-id,env=GITHUB_TOKEN \
  cd /stark_ga && \
  yarn install --production --frozen-lockfile && \
  yarn cache clean --all \
  && cd -

RUN rm -f /stark_ga/.npmrc

COPY src /stark_ga/src

RUN cd /stark_ga && yarn build && cd -

ENTRYPOINT ["/stark_ga/entrypoint.sh"]