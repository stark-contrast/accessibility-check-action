# stark-contrast/accessibility-check-action

Stark's github action to run accessibility checks. Use this action on your repo to run starks accessibility checks within your developer workflow. This runs an accessibility checker within a docker container. 


### How to use this within your repo ?

```yml
on:
  workflow_dispatch:
jobs:
  hello_world_job:
    runs-on: ubuntu-latest
    name: Accessibility check
    steps:
      - name: Checkout code
        id: code-checkout
        uses: actions/checkout@v3
      - name: Stark check
        id: stark
        uses: stark-contrast/accessibility-check-action@main
        with:
            # The following are just shell commands. You can use these to set up the container as needed for your app
            setup: '' # [Optional] set up the container. Install some tools, export variables etc.  
            prebuild: '' # [Optional] any prebuild steps, cd into subdirectories if needed. 
            build: '' # [Optional] build steps. Use && for multiple steps. 
            serve: '' # [Optional] tell us how to serve your app. 
            wait_time: 5000 # [Required, default 5000] milliseconds to wait before your app can start serving
            url: '' # [Required] Where does your app run? eg http://localhost:3000.
            cleanup: '' # [Optional] After scanning, the command running in serve step is auto terminated. Use this to run any cleanup commands.
            min_score: '' # [Optional] Use this to fail this action. A minimum score required so that the pipeline passes.
```