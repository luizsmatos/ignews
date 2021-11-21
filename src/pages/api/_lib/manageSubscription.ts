import { query as q } from 'faunadb';
import { fauna } from '../../../services/fauna';
import { stripe } from '../../../services/stripe';

async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false,
) {
  // Buscar o usuário no banco do FaunaDB com o ID informado.
  // Salvar os dados da subscription no banco do FaunaDB.

  const useRef = await fauna.query(
    q.Select(
      'ref',
      q.Get(q.Match(q.Index('users_by_stripe_customer_id'), customerId))
    )
  );

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscription.id,
    userId: useRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
  };
  

  if(createAction) {
    await fauna.query(
      q.Create(q.Collection('subscriptions'), { data: subscriptionData })
    );
  } else {
    console.log(subscriptionData);
    console.log(subscriptionId)
    await fauna.query(
      q.Replace(
        q.Select(
          'ref',
          q.Get(
            q.Match(
              q.Index('subscription_by_id'),
              subscription.id,
            )
          )
        ),
        { data: subscriptionData },
      )
    )
  }

}

export default saveSubscription;
