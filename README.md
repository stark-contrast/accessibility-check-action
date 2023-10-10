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
        uses: stark-contrast/accessibility-check-action@0.3.0-beta.0
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

            # [Required] The URLs that need to be scanned
            # Example: 
            #     urls:|-
            #          http://localhost:3000
            #          http://localhost:3000/about
            #          http://localhost:3000/help
            #     urls:'
            #          http://localhost:3000
            #          http://localhost:3000/about
            #          http://localhost:3000/help
            #          '
            urls: 

            # [Optional] Shell commands to run after the action finishes a scan.
            # Use this to run any cleanup commands.
            cleanup: ''
```

The Stark action offers convenient arguments for building and serving your repository. For most builds, the key arguments you’ll need to configure are `build`, `serve`, and `url`. At a minimum, you’ll want to configure `url` and `wait_time`.

As with any GitHub workflow, you have all the power — all the action needs is the URL to scan. You’re free to configure your workflow however else you want.

Once you’ve configured and committed your workflow to the default branch of your repository, you’re all set, and can now [return to your Stark project](https://account.getstark.co/projects) and run accessibility scans.

## More Examples

We have several repositories available that demonstrate how you can configure your workflow for popular web tooling:

- [Vite](https://github.com/stark-projects-demos/vite-demo)
- [Next.js](https://github.com/stark-projects-demos/nextjs-demo)
- [Gatsby](https://github.com/stark-projects-demos/gatsby-demo)

## Technical Details

Internally, the Stark Github action runs its code inside a `node-18` process. The process passes everything written within the `setup`, `prebuild`, `build`, `serve`, and `cleanup` parameters to the default shell on the image. That gives you the ability to run any kind of script you would like within these commands. The `serve` argument is slightly different: it starts a detached process that is killed automatically when our step ends. If you would like to explicitly kill the process (for instance, to safely close some database connections), use the `cleanup` script.
