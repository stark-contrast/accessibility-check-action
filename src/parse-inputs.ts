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
  puppeteerTimeout: string
  puppeteerWaitUntil: string[]
  stealthMode: boolean
  skipErrors: boolean
  scanDelay: string
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
  const puppeteerTimeout = getCoreInputWithFallback(
    'puppeteer_timeout',
    '30000'
  )
  const puppeteerWaitUntilInputString = getCoreInputWithFallback(
    'puppeteer_wait_until',
    'load'
  )
  const puppeteerWaitUntil = parseMultilineString(puppeteerWaitUntilInputString)
  const stealthMode = !!core.getBooleanInput('stealth_mode')
  const skipErrors = !!core.getBooleanInput('skip_errors')
  const scanDelay = getCoreInputWithFallback('scan_delay', '100')
  // The only required param, should throw an exception on no value or empty value
  const urlInputString = core.getInput('urls', {required: true})
  const urls = parseMultilineString(urlInputString)
  const minScore = getCoreInputWithFallback('min_score', '0')
  const sleepTime = getCoreInputWithFallback('wait_time', '5000')
  const token = getCoreInputWithFallback('token', '')

  const parsedInputs = {
    setupScript,
    preBuildScript,
    buildScript,
    serveScript,
    cleanupScript,
    urls,
    minScore,
    sleepTime,
    token,
    puppeteerTimeout,
    puppeteerWaitUntil,
    stealthMode,
    skipErrors,
    scanDelay
  }
  core.debug(`Provided inputs: ${JSON.stringify(parsedInputs)}`)
  return parsedInputs
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
 * @param input List of urls, from the actions input
 * separated by newline, whitespace and empty urls are removed.
 * @returns Array of urls
 */
export function parseMultilineString(input: string): string[] {
  return input
    .split(/\r|\n/)
    .map(value => value.trim())
    .filter(value => !!value)
}
