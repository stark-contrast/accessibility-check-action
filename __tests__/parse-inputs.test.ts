import {afterEach, describe} from 'node:test'
import {getInput, getBooleanInput} from '@actions/core'
import {expect, jest, test} from '@jest/globals'
import {
  InputParams,
  getCoreInputWithFallback,
  parseInputs,
  parseMultilineString
} from '../src/parse-inputs'

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  getBooleanInput: jest.fn(),
  debug: jest.fn()
}))

describe('getCoreInputSafe', () => {
  test('should return value if it exists', () => {
    ;(getInput as jest.Mock).mockReturnValueOnce('value')
    const value = getCoreInputWithFallback('somekey', 'default')
    expect(value).toBe('value')
  })
  test('should return default value if it does not exist', () => {
    ;(getInput as jest.Mock).mockReturnValueOnce(undefined)
    const value = getCoreInputWithFallback('somekey', 'default')
    expect(value).toBe('default')
  })
  test('should return default value if it is empty', () => {
    ;(getInput as jest.Mock).mockReturnValueOnce('')
    const value = getCoreInputWithFallback('somekey', 'default')
    expect(value).toBe('default')
  })
})

describe('parseInput', () => {
  afterEach(() => {
    ;(getInput as jest.Mock).mockClear()
    ;(getBooleanInput as jest.Mock).mockClear()
  })
  test('should return correct default values', () => {
    ;(getInput as jest.Mock).mockImplementation(key => {
      const multilineUrls =
        'localhost:3000/test \n\
      localhost:3000/about'
      return key === 'urls' ? multilineUrls : ''
    })
    const expectedInputs: InputParams = {
      setupScript: 'echo "No setup script"',
      preBuildScript: 'echo "No prebuild script"',
      buildScript: 'echo "No build script"',
      serveScript: 'echo "No serve script"',
      cleanupScript: 'echo "No cleanup script"',
      urls: ['localhost:3000/test', 'localhost:3000/about'],
      minScore: '0',
      sleepTime: '5000',
      token: '',
      puppeteerTimeout: '30000',
      puppeteerWaitUntil: ['load'],
      scanDelay: '100',
      skipErrors: false,
      stealthMode: false
    }

    const inputs = parseInputs()

    expect(inputs).toEqual(expectedInputs)
  })
  test('should throw if urls is not provided', () => {
    ;(getInput as jest.Mock).mockImplementation(key => {
      if (key === 'urls') throw new Error('')
      return ''
    })

    expect(parseInputs).toThrowError()
  })
})

describe('parseUrls', () => {
  test('should trim whitespaces', () => {
    const multiUrlString =
      '      localhost:3000/test\n          http://localhost:5000/test'
    const urls = parseMultilineString(multiUrlString)

    const expected = ['localhost:3000/test', 'http://localhost:5000/test']
    expect(urls).toEqual(expected)
  })

  test('should skip empty lines', () => {
    const multiUrlString =
      '\n\
    localhost:3000/test\n\
    http://localhost:5000/test'
    const urls = parseMultilineString(multiUrlString)

    const expected = ['localhost:3000/test', 'http://localhost:5000/test']
    expect(urls).toEqual(expected)
  })
})
