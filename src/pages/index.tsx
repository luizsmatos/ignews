import { GetStaticProps } from 'next';
import Image from 'next/image';
import Head from 'next/head';

import styles from './home.module.scss';
import { SubscribeButton } from '../components/SubscribeButton';
import { stripe } from '../services/stripe';

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👋 <span>Hey, welcome.</span></span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for { product.amount } month</span>
          </p>
          <SubscribeButton priceId={ product.priceId } />
        </section>
        <Image
          src="/images/avatar.svg"
          alt="Girl coding"
          width={336}
          height={521}
        />
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // Client-side - Informação quando o usuario acessa a pagina.
  // Server-side - Quando há necessiidade de indexação de dados, e podemos ser mais dinamicos
  // Static Site Generation - Salvar HTML

  // Post do Blog 

  // Conteudo (SSG)
  // Comentarios (Client-side)
  // Posts (SSR)
  
  const price = await stripe.prices.retrieve('price_1JwUkGB2iBcLQdU10BUH4b6Y')

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price.unit_amount / 100),
  };

  return {
    props: {
      product,
    },
    revalidate: 60 * 60 * 24, // 1 day
  }

}
