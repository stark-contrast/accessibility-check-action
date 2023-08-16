# Accessibility Check Action

In order for Stark to scan your GitHub web repository, you’ll need to set up a custom workflow. This workflow enables Stark to scan your web repository for accessibility issues.

## Setting up your repository

First, create a Github workflow file at `.github/workflows/starkflow.yml`. (The file name is important: that’s how Stark finds the correct workflow to run.)

Next, copy and paste  the following template (update the necessary defaults and remove empty params):

```yml
name: Stark Web Audit
run-name: ${{ github.event.inputs.displayTitle }}

on:
  workflow_dispatch:
    inputs:
      token:
        description: 'Stark Token'
        required: true
      displayTitle:
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
        uses: stark-contrast/accessibility-check-action@0.2.0-beta.0
        with:
            # [Required] The token used by the action to send an audit report back to Stark.
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

            # [Required] The URL your app is being served at.
            # Example: 'http://localhost:3000'
            url: ''

            # [Optional] Shell commands to run after the action finishes a scan.
            # Use this to run any cleanup commands.
            cleanup: ''
```

The Stark action offers convenient arguments for building and serving your repository. For most builds, the key arguments you’ll need to configure are `build`, `serve`, and `url`. At a minimum, you’ll want to configure `url` and `wait_time`.

As with any GitHub workflow, you have all the power — all the action needs is the URL to scan. You’re free to configure your workflow however else you want.

Once you’ve configured and committed your workflow to the default branch of your repository, you’re all set, and can now [return to your Stark project](https://account.getstark.co/projects) and run accessibility scans.

## Implementation Details

Internally, the Stark Github action runs its code inside a `node-18` process. The process passes everything written within the `setup`, `prebuild`, `build`, `serve`, and `cleanup` parameters to the default shell on the image. That gives you the ability to run any kind of script you would like within these commands. The `serve` argument is slightly different: it starts a detached process that is killed automatically when our step ends. If you would like to explicitly kill the process (for instance, to safely close some database connections), use the `cleanup` script.
