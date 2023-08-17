import * as core from '@actions/core'

export type InputParams = {
  setupScript: string
  preBuildScript: string
  buildScript: string
  serveScript: string
  cleanupScript: string
  url: string
  minScore: string
  sleepTime: string
  token: string
}

export function parseInputs(): InputParams {
  const setupScript = getCoreInputSafe('setup', 'echo "No setup script"')
  const preBuildScript = getCoreInputSafe('prebuild', 'echo "No prebuild script"')
  const buildScript = getCoreInputSafe('build', 'echo "No build script"')
  const serveScript = getCoreInputSafe('serve', 'echo "No serve script"')
  const cleanupScript = getCoreInputSafe('cleanup', 'echo "No cleanup script"')
  // The only required param, should throw an exception on no value or empty value
  const url = core.getInput('url', {required: true})
  const minScore = getCoreInputSafe('min_score', '0')
  const sleepTime = getCoreInputSafe('wait_time', '5000')
  const token = getCoreInputSafe('token', '')

  return {
    setupScript,
    preBuildScript,
    buildScript,
    serveScript,
    cleanupScript,
    url,
    minScore,
    sleepTime,
    token
  }
}

export function getCoreInputSafe(paramName: string, fallback: string): string {
    return core.getInput(paramName) || fallback
}