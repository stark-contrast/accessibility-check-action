import {dumpDataToFile, dumpMetadata, extractGithubData} from '../src/metadata'
import {expect, test} from '@jest/globals'
import * as fs from 'fs/promises'
import {pick} from 'lodash'
import {describe} from 'node:test'

describe('extractGithubData', () => {
  test('should extract correct data for github', async () => {
    const testData = JSON.parse(
      await fs.readFile('__tests__/mocks/github.json', 'utf-8')
    )
    const expectedData = {
      context: {
        payload: {
          organization: {
            avatar_url: 'https://avatars.githubusercontent.com/u/26553318?v=4',
            description:
              'The suite of integrated accessibility tools for your product design and development team.',
            events_url: 'https://api.github.com/orgs/stark-contrast/events',
            hooks_url: 'https://api.github.com/orgs/stark-contrast/hooks',
            id: 26553318,
            issues_url: 'https://api.github.com/orgs/stark-contrast/issues',
            login: 'stark-contrast',
            members_url:
              'https://api.github.com/orgs/stark-contrast/members{/member}',
            node_id: 'MDEyOk9yZ2FuaXphdGlvbjI2NTUzMzE4',
            public_members_url:
              'https://api.github.com/orgs/stark-contrast/public_members{/member}',
            repos_url: 'https://api.github.com/orgs/stark-contrast/repos',
            url: 'https://api.github.com/orgs/stark-contrast'
          }
        },
        eventName: 'pull_request',
        sha: '149d2728d186a2100ad5cfd646c483827b5b890f',
        ref: 'refs/pull/19/merge',
        workflow: 'test-gh-data',
        action: '__self',
        actor: 'abcdefghiraj',
        job: 'test',
        runNumber: 2,
        runId: 5659967137,
        apiUrl: 'https://api.github.com',
        serverUrl: 'https://github.com',
        graphqlUrl: 'https://api.github.com/graphql'
      }
    }
    const extractedData = extractGithubData(testData)
    expect(extractedData).toEqual(expectedData)
  })

  test('should return only the existing keys correctly', async () => {
    const testData = JSON.parse(
      await fs.readFile('__tests__/mocks/github.json', 'utf-8')
    )
    const expectedData = {
      context: {
        eventName: 'pull_request',
        sha: '149d2728d186a2100ad5cfd646c483827b5b890f',
        ref: 'refs/pull/19/merge',
        graphqlUrl: 'https://api.github.com/graphql'
      }
    }
    const modifiedData = pick(
      testData,
      ...[
        'context.eventName',
        'context.sha',
        'context.ref',
        'context.graphqlUrl'
      ]
    )
    const extractedData = extractGithubData(modifiedData)
    expect(extractedData).toEqual(expectedData)
  })
})

describe('dumpDataToFile', () => {
  test("should create .stark-metadata/file.json even if directory doesn't exist", async () => {
    // @ts-ignore
    const dirPath = await dumpDataToFile({file: {test: 'test'}})
    const files = await fs.readdir(dirPath)
    await fs.rm('.stark-metadata', {recursive: true, force: true})
    expect(files).toContain('file.json')
  })
  test('should create .stark-metadata/github.json even if directory already exists', async () => {
    await fs.mkdir('.stark-metadata')
    const dirPath = await dumpDataToFile({github: {test: 'test'}})
    const files = await fs.readdir(dirPath)
    await fs.rm('.stark-metadata', {recursive: true, force: true})
    expect(files).toContain('github.json')
  })
})

describe('dumpMetadata', () => {
  test('should create .stark-metadata/github.json with correct data', async () => {
    const testData = JSON.parse(
      await fs.readFile('__tests__/mocks/github.json', 'utf-8')
    )
    const expectedData = {
      context: {
        payload: {
          organization: {
            avatar_url: 'https://avatars.githubusercontent.com/u/26553318?v=4',
            description:
              'The suite of integrated accessibility tools for your product design and development team.',
            events_url: 'https://api.github.com/orgs/stark-contrast/events',
            hooks_url: 'https://api.github.com/orgs/stark-contrast/hooks',
            id: 26553318,
            issues_url: 'https://api.github.com/orgs/stark-contrast/issues',
            login: 'stark-contrast',
            members_url:
              'https://api.github.com/orgs/stark-contrast/members{/member}',
            node_id: 'MDEyOk9yZ2FuaXphdGlvbjI2NTUzMzE4',
            public_members_url:
              'https://api.github.com/orgs/stark-contrast/public_members{/member}',
            repos_url: 'https://api.github.com/orgs/stark-contrast/repos',
            url: 'https://api.github.com/orgs/stark-contrast'
          }
        },
        eventName: 'pull_request',
        sha: '149d2728d186a2100ad5cfd646c483827b5b890f',
        ref: 'refs/pull/19/merge',
        workflow: 'test-gh-data',
        action: '__self',
        actor: 'abcdefghiraj',
        job: 'test',
        runNumber: 2,
        runId: 5659967137,
        apiUrl: 'https://api.github.com',
        serverUrl: 'https://github.com',
        graphqlUrl: 'https://api.github.com/graphql'
      }
    }
    const dirPath = await dumpMetadata(testData, 'github')
    const outData = JSON.parse(
      await fs.readFile(`${dirPath}/github.json`, 'utf-8')
    )
    await fs.rm('.stark-metadata', {recursive: true, force: true})
    expect(outData).toEqual(expectedData)
  })
})
