import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from 'next-auth/react'
import { query as q } from 'faunadb'
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

type User = {
  ref: {
    id: string;
  },
  data: {
    stripe_customer_id: string;
  }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  //only allows POST method
  if(req.method === 'POST'){
    //gets the session from NextAuth context provider
    const session = await getSession({req})

    //gets user by the github email
    const user = await fauna.query<User>(
          q.Get(
          q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    )

    let customerId = user.data.stripe_customer_id

    //checks if there is a user with an id equals in the database, creating a new user otherwise
    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
      email: session.user.email,
      //metadata
      })

      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), user.ref.id),
          {
            data: {
              stripe_customer_id: stripeCustomer.id
            }
          }
        )
      )

      customerId = stripeCustomer.id
    }


    const stripeChecktoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'], 
      billing_address_collection: 'required',
      line_items: [
        {price: 'price_1Kwvr9G9KraP7hISPNHRaN0N', quantity: 1}
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: 'http://localhost:3000/posts',
      cancel_url: 'http://localhost:3000'
    })

    return res.status(200).json({ sessionId: stripeChecktoutSession.id })
  } else {
  res.setHeader('Allow', 'POST')
  res.status(405).end('Mehtod not allowed')
  }
}