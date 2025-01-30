# accessibility-check-action

## Table of Contents

- [Usage](#usage)
- [Connecting with Stark Projects](#connecting-with-stark-projects)
- [More Examples](#more-examples)
- [Technical Details](#technical-details)

## Usage

Usage of the action is exactly as shown in the next section's template, except you don't need to provide the action a `token`.

## Connecting with Stark Projects

### Setting up a repository's workflow

To use Stark Projects to scan your Github repositories for accessibility issues, you’ll need to set up custom workflows in those repositories.

Begin by creating a GitHub workflow file at `.github/workflows/starkflow.yml`. Using the right file path and name is important, otherwise Stark won't be able to scan your repository.

Next, use the following template for your workflow, updating the appropriate values as indicated:

```yml
name: Stark Web Audit
run-name: ${{ github.event.inputs.display-title }}

on:
  workflow_dispatch:
    inputs:
      # Used to send this scan's results back to Stark.
      token:
        description: 'Stark token'
        required: true
      # Allows Stark to identify this scan.
      display-title:
        description: 'Display title'
        required: true

jobs:
  accessibility-audit:
    runs-on: ubuntu-latest

    name: Accessibility Audit
    steps:
      - name: Checkout code
        id: code-checkout
        uses: actions/checkout@v3

      - name: Audit
        id: stark
        uses: stark-contrast/accessibility-check-action@1.2.2
        with:
          # [Optional; only required when used with Stark Projects]
          # The token used by the action to send an audit report back to Stark.
          token: ${{ github.event.inputs.token }}

          # [Optional] Shell commands for setting up the container.
          # You can use this to install tools, export variables, etc.
          # Example: 'nvm install 16 && nvm use 16'
          setup: ''

          # [Optional] Shell comamnds to run before the app is built.
          # Run any prebuild steps, cd into subdirectories, etc.
          prebuild: ''

          # [Optional] Shell commands for building your app.
          # Example: 'npm run build'
          build: ''

          # [Optional] Shell commands for serving your app.
          # This command is slightly different from the others: it runs in a long-lived,
          # detached process that is only terminated when the scan finishes and our action stops.
          # Example: 'SERVER_PORT=3000 && npm run serve'
          serve: ''

          # [Optional] The number of milliseconds to wait before your app is ready.
          # Defaults to 5000 milliseconds.
          wait_time: 5000

          # [Required] A list of URLs to be scanned, with each URL belonging to its own line. This value follows YAML conventions for multiline strings.
          # Example:
          #     urls:|-
          #          http://localhost:3000
          #          http://localhost:3000/about
          #          http://localhost:3000/help
          # OR
          #     urls:'
          #          http://localhost:3000
          #
          #          http://localhost:3000/about
          #
          #          http://localhost:3000/help
          #          '
          urls: ''

          # [Optional] Navigation timeout for puppeteer in ms. How long should puppeteer wait till it checks page load (wait until event) is complete.
          # Note: This timeout applies to all pages in your url list individually
          # Defaults to 30000 ms
          puppeteer_timeout: 30000

          # [Optional] Event that puppeteer looks out for to assume completed navigation to a given page. In case of multiple values, navigation is considered to be successful after all events have been fired
          # This can be multiple values from [load, domcontentloaded, networkidle0, networkidle2], with each value belonging to its own line.
          # This value follows YAML conventions for multiline strings.
          # Example:
          #   puppeteer_wait_until: |-
          #                         load
          #                         domcontentloaded
          # Defaults to load
          puppeteer_wait_until: 'load'

          # [Optional] Run puppeteer in stealth mode. Attempts to hide puppeteer from your server. Won't be necessary for localhost
          # Note: Uses puppeteer-extra stealth-mode. This is not a guaranteed way to hide usage of automated software to control browsers.
          # Defaults to false (use if you have bot checks in your server code)
          stealth_mode: false

          # [Optional] If a url scan failed, scans the next one without failing the action.
          # Defaults to false
          skip_errors: false

          # [Optional] Adds a delay before running the scan. This is different from the timeout and delay in the sense that this delay occurs after the page is navigated to.
          # Defaults to 100
          scan_delay: 500

          # [Optional] Shell commands to run after the action finishes a scan.
          # Use this to run any cleanup commands.
          cleanup: ''

          # [Optional] Puppeteer browser viewport [width]x[height].
          # Use this to specify a browser window size for your scan.
          # Defaults to 800x600
          viewport: '800x600'
```

The Stark action offers convenient arguments for building and serving your repository. For most builds, the key arguments you’ll need to configure are `build`, `serve`, and `urls`. At a minimum, you’ll want to configure `urls` and `wait_time`.

As with any GitHub workflow, you have all the power — all the action needs are URLs to scan. You’re free to configure your workflow however else you want.

Once you’ve configured and committed your workflow to the default branch of your repository, you’re all set, and can now [return to your Stark project](https://account.getstark.co/projects) and run accessibility scans.

## More Examples

We have several repositories available that demonstrate how you can configure your workflow for popular web tooling:

- [Vite](https://github.com/stark-projects-demos/vite-demo)
- [Next.js](https://github.com/stark-projects-demos/nextjs-demo)
- [Gatsby](https://github.com/stark-projects-demos/gatsby-demo)

## Technical Details

Internally, the Stark Github action runs its code inside a `node-18` process. The process passes everything written within the `setup`, `prebuild`, `build`, `serve`, and `cleanup` parameters to the default shell on the image. That gives you the ability to run any kind of script you would like within these commands. The `serve` argument is slightly different: it starts a detached process that is killed automatically when our step ends. If you would like to explicitly kill the process (for instance, to safely close some database connections), use the `cleanup` script.
