import path from 'path'
import {readResults} from '../src/read-results'
import {expect, test} from '@jest/globals'

test('reads data correctly', async () => {
  const dirName = path.resolve('./__tests__/mocks/')
  const results = await readResults(dirName)
  expect(results[0].data[0].value).toBe(94.20289855072464)
})
