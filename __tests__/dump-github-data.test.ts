import {dumpGithubData} from '../src/dump-github-data'
import {expect, test, afterAll} from '@jest/globals'
import * as fs from 'fs/promises'
import { beforeEach } from 'node:test'

afterAll(async () => {
    try {
        await fs.rm('.stark-metadata', {recursive: true, force: true})       
    } catch (error) {
        
    }
})

test('dumps data at .stark-metadata/github.json', async () => {
    const testData = JSON.parse(await fs.readFile('__tests__/mocks/github.json','utf-8'))
    const metadataDir = await dumpGithubData(testData)
    expect(metadataDir.indexOf('.stark-metadata')).toBeGreaterThanOrEqual(0)
    const files = await fs.readdir(metadataDir)
    expect(files).toContain('github.json')
    await fs.rm(metadataDir, {recursive: true, force: true})
})

test('dumps correct data at .stark-metadata/github.json', async () => {
    const testData = JSON.parse(await fs.readFile('__tests__/mocks/github.json','utf-8'))
    const metadataDir = await dumpGithubData(testData)
    const githubMetadata =  JSON.parse(await fs.readFile(`${metadataDir}/github.json`,'utf-8'))
    const expectedData = {
        "context": {
          "payload": {
            "organization": {
              "avatar_url": "https://avatars.githubusercontent.com/u/26553318?v=4",
              "description": "The suite of integrated accessibility tools for your product design and development team.",
              "events_url": "https://api.github.com/orgs/stark-contrast/events",
              "hooks_url": "https://api.github.com/orgs/stark-contrast/hooks",
              "id": 26553318,
              "issues_url": "https://api.github.com/orgs/stark-contrast/issues",
              "login": "stark-contrast",
              "members_url": "https://api.github.com/orgs/stark-contrast/members{/member}",
              "node_id": "MDEyOk9yZ2FuaXphdGlvbjI2NTUzMzE4",
              "public_members_url": "https://api.github.com/orgs/stark-contrast/public_members{/member}",
              "repos_url": "https://api.github.com/orgs/stark-contrast/repos",
              "url": "https://api.github.com/orgs/stark-contrast"
            },
          },
          "eventName": "pull_request",
          "sha": "149d2728d186a2100ad5cfd646c483827b5b890f",
          "ref": "refs/pull/19/merge",
          "workflow": "test-gh-data",
          "action": "__self",
          "actor": "abcdefghiraj",
          "job": "test",
          "runNumber": 2,
          "runId": 5659967137,
          "apiUrl": "https://api.github.com",
          "serverUrl": "https://github.com",
          "graphqlUrl": "https://api.github.com/graphql"
        }
      }
    expect(githubMetadata).toEqual(expectedData)
    await fs.rm(metadataDir, {recursive: true, force: true})
})

