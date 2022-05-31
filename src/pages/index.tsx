import { GetServerSideProps } from 'next'
import Head from 'next/head';
import { SubscribeButton } from '../components/SubscribeButton/SubscribeButton';

import styles from './home.module.scss'

export default function Home(props) {

  return (
    <>
      <Head>
        <title>Home - ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get accsess to all publications <br/>
            <span>
              for $9,90 a month.
            </span>
          </p>
          <SubscribeButton />
        </section>
        <img src='/images/avatar.svg' alt='Girl coding.' />
      </main>
    </>
  )
}

export const getServerSideProps : GetServerSideProps = async () => {

  console.log('ok');
  return {
    props: {
      nome: 'Vritu'
    }
  }
}