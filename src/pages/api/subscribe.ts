import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import { stripe } from '../../services/stripe';

async function Subscribe(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Recupera o token do usuário, salvo nos cookies
    const session = await getSession( { req } );

    // Cria um customer para o usuário no Stripe
    const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
      // metadata
    });

    // Cria uma Checkout Session para o usuário
    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: 'price_1JwUkGB2iBcLQdU10BUH4b6Y', quantity: 1,
        }
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
};

export default Subscribe;
