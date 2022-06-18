import * as prismic from '@prismicio/client'
import { enableAutoPreviews } from '@prismicio/next'
import { config, execArgv } from 'process'
import sm from '../../sm.json'

export const endpoint = sm.apiEndpoint
export const repositoryName = prismic.getRepositoryName(endpoint)

// Update the Link Resolver to match your project's route structure
export function linkResolver(doc) {
  switch (doc.type) {
    case 'homepage':
      return '/'
    case 'page':
      return `/${doc.uid}`
    default:
      return null
  }
}


// This factory function allows smooth preview setup
export async function createClient(config = {} as any){ 
  //creating a new client every thime when fetching data is recommended
  const client = await prismic.createClient(endpoint, {
    accessToken: process.env.PRISMIC_TOKEN
  })

  enableAutoPreviews({
    client,
    previewData: config.previewData,
    req: config.req,
  }
  )
  return client
}
