import { NextApiRequest, NextApiResponse } from 'next';
import { query as q } from 'faunadb';
import { getSession } from 'next-auth/client';
import { fauna } from '../../services/fauna';
import { stripe } from '../../services/stripe';

type User = {
  ref: {
    id: string;
  };
  data: {
    stripe_customer_id: string;
  };
};

async function Subscribe(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Recupera o token do usuário, salvo nos cookies.
    const session = await getSession({ req });

    // Recupera o usuário no faunaDB, pelo email.
    const user = await fauna.query<User>(
      q.Get(q.Match(q.Index('users_by_email'), q.Casefold(session.user.email)))
    );

    let customerId = user.data.stripe_customer_id;

    if (!customerId) {
      // Cria um customer para o usuário no Stripe
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email,
        // metadata
      });
      await fauna.query(
        q.Update(q.Ref(q.Collection('users'), user.ref.id), {
          data: {
            stripe_customer_id: stripeCustomer.id,
          },
        })
      );

      customerId = stripeCustomer.id;
    }

    // Salva o customer no Fauna

    // Cria uma Checkout Session para o usuário
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: 'price_1JwUkGB2iBcLQdU10BUH4b6Y',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return res.status(200).json({
      sessionId: stripeCheckoutSession.id,
    });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default Subscribe;
