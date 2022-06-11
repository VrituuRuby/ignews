
import { query as q} from 'faunadb'
import { fauna } from "../../../services/fauna";
import { stripe } from '../../../services/stripe';

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  isCreateAction = false
  ){
  //Gets user reference idex in fauna's data base by 'customerId'
  const userRef = await fauna.query(
    q.Select(
      'ref',
      q.Get(
        q.Match(
          q.Index('user_by_stripe_customer_id'),
          customerId
        )
      )
    )
  )   
  //Saves data from user's subscription in the database
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionData = {
    id: subscriptionId,
    userId: userRef,
    status: subscription.status,
    priceId: subscription.items.data[0].price.id,

  }
  if (isCreateAction){
    await fauna.query(
      q.Create(
        q.Collection('subscriptions'),
        {data: subscriptionData}
      )
    )
  } else {
    await fauna.query(
      //Replace the whole subscription in the DB
      q.Replace(
        //Select only one info/data, in this case the Ref
        q.Select(
          "ref",
          q.Get(
            q.Match(
              q.Index('subscription_by_id'),
              subscriptionId
            )
          )
        ),
        //replacing data
        {data: subscriptionData}
      )
    )
  }

}