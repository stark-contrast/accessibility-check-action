import * as core from '@actions/core'
import {isEmpty} from 'lodash'

export type InputParams = {
  setupScript: string
  preBuildScript: string
  buildScript: string
  serveScript: string
  cleanupScript: string
  urls: string[]
  minScore: string
  sleepTime: string
  token: string
}
/**
 * Function to parse inputs from github action. Replaces empty values with sensible defaults
 * @returns InputParams
 */
export function parseInputs(): InputParams {
  const setupScript = getCoreInputWithFallback(
    'setup',
    'echo "No setup script"'
  )
  const preBuildScript = getCoreInputWithFallback(
    'prebuild',
    'echo "No prebuild script"'
  )
  const buildScript = getCoreInputWithFallback(
    'build',
    'echo "No build script"'
  )
  const serveScript = getCoreInputWithFallback(
    'serve',
    'echo "No serve script"'
  )
  const cleanupScript = getCoreInputWithFallback(
    'cleanup',
    'echo "No cleanup script"'
  )
  // The only required param, should throw an exception on no value or empty value
  const urlInputString = core.getInput('url', {required: true})
  const urls = parseUrls(urlInputString)
  const minScore = getCoreInputWithFallback('min_score', '0')
  const sleepTime = getCoreInputWithFallback('wait_time', '5000')
  const token = getCoreInputWithFallback('token', '')

  return {
    setupScript,
    preBuildScript,
    buildScript,
    serveScript,
    cleanupScript,
    urls,
    minScore,
    sleepTime,
    token
  }
}

export function getCoreInputWithFallback(
  paramName: string,
  fallback: string
): string {
  const inputValue = core.getInput(paramName)
  return !isEmpty(inputValue) ? inputValue : fallback
}

/**
 * Accepts the actions list of urls and parses them to an array.
 *
 * @param input List of secrets, from the actions input, can be
 * comma-delimited or newline, whitespace around secret entires is removed.
 * @returns Array of References for each secret, in the same order they were
 * given.
 */
export function parseUrls(input: string): string[] {
  return input
    .split(/\r|\n/)
    .map(url => url.trim())
    .filter(url => !!url)
}
