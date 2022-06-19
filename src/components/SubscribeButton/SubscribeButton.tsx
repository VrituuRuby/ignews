import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss'

interface SubscribeButtonProps {
    priceId: string;
}

export function SubscribeButton({priceId} : SubscribeButtonProps){
    const {data: session} = useSession();
    const route = useRouter()

    //verifies if user is logged in already to create Stripe's checkout session
    async function handeleSubscribe(){
        //
        if (!session) {
            signIn('github')
        return
    }

    if (session.activeSubscription){
        route.push('/posts')
        return;
    }
    
    // checkout session creation
    try {
        const response = await api.post('/subscribe')

        const { sessionId } = response.data

        const stripe = await getStripeJs()

        await stripe.redirectToCheckout({ sessionId })
    } catch (err){
        alert(err.message)
    }

    }
    

    return (
        <button
            type="button"
            className={styles.subscribeButton}
            onClick={()=>handeleSubscribe()}
        >
            Subscribe now
        </button>
    )
}