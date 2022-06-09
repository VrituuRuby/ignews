import { GetStaticProps } from 'next'
import Head from 'next/head';
import { SubscribeButton } from '../components/SubscribeButton/SubscribeButton';
import { stripe } from '../services/stripe';

import styles from './home.module.scss'

interface homeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product } : homeProps) {

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
              for {product.amount} a month.
            </span>
          </p>
          <SubscribeButton priceId={product.priceId}/>
        </section>
        <img src='/images/avatar.svg' alt='Girl coding.' />
      </main>
    </>
  )
}


//StaticSiteGeneration -> This code runs in next's node layer in the browser - not a 24h running server
export const getStaticProps : GetStaticProps = async () => {
  const price = await stripe.prices.retrieve('price_1Kwvr9G9KraP7hISPNHRaN0N')

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount/100)
  }
  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24, //24 hours
  }
}