import {afterEach, describe} from 'node:test'
import {getInput} from '@actions/core'
import {expect, jest, test} from '@jest/globals'
import {InputParams, getCoreInputSafe, parseInputs} from '../src/parse-inputs'

jest.mock('@actions/core', () => ({
  getInput: jest.fn()
}))

describe('getCoreInputSafe', () => {
  test('should return value if it exists', () => {
    ;(getInput as jest.Mock).mockReturnValueOnce('value')
    const value = getCoreInputSafe('somekey', 'default')
    expect(value).toBe('value')
  })
  test('should return default value if it does not exist', () => {
    ;(getInput as jest.Mock).mockReturnValueOnce(undefined)
    const value = getCoreInputSafe('somekey', 'default')
    expect(value).toBe('default')
  })
  test('should return default value if it is empty', () => {
    ;(getInput as jest.Mock).mockReturnValueOnce('')
    const value = getCoreInputSafe('somekey', 'default')
    expect(value).toBe('default')
  })
})

describe('parseInput', () => {
  afterEach(() => {
    ;(getInput as jest.Mock).mockClear()
  })
  test('should return correct default values', () => {
    ;(getInput as jest.Mock).mockImplementation(key => {
      return key === 'url' ? 'localhost:3000/test' : ''
    })
    const expectedInputs: InputParams = {
      setupScript: 'echo "No setup script"',
      preBuildScript: 'echo "No prebuild script"',
      buildScript: 'echo "No build script"',
      serveScript: 'echo "No serve script"',
      cleanupScript: 'echo "No cleanup script"',
      url: 'localhost:3000/test',
      minScore: '0',
      sleepTime: '5000',
      token: ''
    }

    const inputs = parseInputs()

    expect(inputs).toEqual(expectedInputs)
  })
  test('should throw if url is not provided', () => {
    ;(getInput as jest.Mock).mockImplementation(key => {
      if (key === 'url') throw new Error('')
      return ''
    })

    expect(parseInputs).toThrowError()
  })
})
