import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

//transform stripe stream of events into readable data
async function buffer(readable: Readable){
  const chunks = [];

  for await (const chunk of readable){
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : chunk
    );
  }

  return Buffer.concat(chunks);
}

export const config = {
  api: {
    bodyParser: false
  }
}

//estabilihes the event types wanted as readable
const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
])

export default async function (req: NextApiRequest, res: NextApiResponse){
  
  //only POST method is allowed
  if (req.method === 'POST') {
    const buf = await buffer(req) 
    const secret = req.headers['stripe-signature'] //gets the sign in secret from the requisiton

    let event: Stripe.Event;

    //if the signin secret isn't the same as the one in the local variables throws an error
    try {
      //listens to the stripe's webhooks that triggers when something updates, and certifies that it's coming from
      //reliable eviroment with the secret sign ing key matching
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET)
    } catch(err) {
      return res.status(400).send(`Webhook error: ${err}`)
    }

    const {type} = event //get the type of the event that happened in the stripe's stream

    //checks if the event tyoes is one of the estabilshed as readable from the releveantEvents Set 
    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          //if event type is related to creating, updating or deleting a subscription 
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription;
            
            await saveSubscription(
              subscription.id,
              subscription.customer.toString()
            )
          break;

          //if event type is when checkout and payment is completed
          case 'checkout.session.completed':
            const checkoutSession = event.data.object as Stripe.Checkout.Session

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            )
          break;


          //if the event type isn't listed as readble throws an error  
          default:
            throw new Error('Unhandled event.') 
        }
  
      } catch (err){
        return res.json({error: 'Webhook handler failed.'})
      }
    }
    res.json({recieved: true})
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
  
  
}