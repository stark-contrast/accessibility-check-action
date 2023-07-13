# stark-contrast/accessibility-check-action

In order for Stark to scan your GitHub web repository, you’ll need to set up a custom workflow. This workflow enables Stark to scan your web repository for accessibility issues.

Here’s how:

First, create a Github workflow file at `.github/workflows/starkflow.yml`. (The file name is important — that’s how Stark finds the correct workflow to run!)

Next, copy and paste  the following template:
```yml
name: Stark Web Audit

on:
  workflow_dispatch:
    inputs:
      token:
        description: 'Stark Token'
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
        uses: stark-contrast/accessibility-check-action@0.1.0-beta.0
        with:
        # Most of the following values are simply shell commands. You can use these to set up the container as needed for your app
            token: ${{ github.event.inputs.token }} # The action will use this to send an audit report back to Stark.
            setup: '' # [Optional] Set up the container. Install some tools, export variables, etc.  
            prebuild: '' # [Optional] Run any prebuild steps, cd into subdirectories, etc.
            build: '' # [Optional] Build steps. Use && for multiple steps. 
            serve: '' # [Optional] Tell us how to serve your app. 
            wait_time: 5000 # [Required, default 5000] Milliseconds to wait before your app can start serving
            url: '' # [Required] Where does your app run? e.g. http://localhost:3000.
            cleanup: '' # [Optional] After scanning, the command running in serve step is auto terminated. Use this to run any cleanup commands.
```

The Stark action conveniently takes care of building and serving your repository — you just need to fill in the appropriate shell commands for doing so. For most builds, the key arguments you’ll need to configure are `build`, `serve`, and `url`. At a minimum, you’ll want to configure `url` and `wait_time`.

As with any GitHub workflow, you have all the power — all the action needs is the URL to scan. You’re free to configure your workflow however else you want.

Once you’ve configured and committed your workflow to the default branch of your repository, that’s it! You’re all set, and can now return to your Stark project and run accessibility scans. (One thing to keep in mind: depending on your project and Github, scanning a web project may take a while.)

## Implementation Details

Internally, the Stark Github action runs its code inside a `node-16` process. The process passes everything written within the `setup`, `prebuild`, `build`, `serve`, and `cleanup` parameters to the default shell on the image. That gives you the ability to run any kind of script you would like within these commands. The only different one here is `serve`, which starts a detached process. The process is killed automatically when our step ends. If you would like to explicitly kill the process (for instance, to safely close some database connections), use the `cleanup` script.