import Head from 'next/head'
import { GetStaticProps } from 'next'

import { createClient } from '../../services/prismicio'
import * as prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'

import styles from './styles.module.scss'
import Link from 'next/link'

type PostsProps = {
  posts: {
    slug: string,
    title: string,
    abstract: string,
    updatedAt: string,
  }[]
}

export default function Posts({posts}: PostsProps){
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts?.map((post, index) => (
            <Link href={`/posts/${post.slug}`}>
              <a href="">
                <time>{post?.updatedAt}</time>
                <strong>{post?.title}</strong>
                <p>{post?.abstract}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

//StaticSiteGeneration -> This code runs in next's node layer in the browser - not a 24h running server
export const getStaticProps : GetStaticProps = async ({previewData}) =>{
  const client = await createClient({ previewData })

  const response = await client.get({
    predicates: [
      prismic.predicate.at('document.type', 'post')
    ],
    fetch:['post.title', 'post.content'],
    pageSize: 100,
  })

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      abstract: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })

  return {
    props: {
      posts
    }
  }
}