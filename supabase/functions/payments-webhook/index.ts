import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Map price IDs to credit amounts
const CREDIT_PACKS: Record<string, number> = {
  credits_10: 10,
  credits_50: 50,
  credits_100: 100,
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;

  try {
    const event = await verifyWebhook(req, env);
    console.log('Received event:', event.eventType, 'env:', env);

    switch (event.eventType) {
      case EventName.TransactionCompleted:
        await handleTransactionCompleted(event.data, env);
        break;
      case EventName.TransactionPaymentFailed:
        console.log('Payment failed:', event.data.id, 'env:', env);
        break;
      default:
        console.log('Unhandled event:', event.eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});

async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  const { id, customData, items } = data;

  const userId = customData?.userId;
  if (!userId) {
    console.error('No userId in customData for transaction:', id);
    return;
  }

  // Sum up credits from all items in the transaction
  let totalCredits = 0;
  for (const item of items) {
    const priceExternalId = item.price?.importMeta?.externalId || item.price?.externalId;
    const credits = CREDIT_PACKS[priceExternalId];
    if (credits) {
      totalCredits += credits * (item.quantity || 1);
    } else {
      console.warn('Unknown price ID:', priceExternalId);
    }
  }

  if (totalCredits === 0) {
    console.error('No credits to add for transaction:', id);
    return;
  }

  const { data: result, error } = await supabase.rpc('add_credits', {
    p_user_id: userId,
    p_amount: totalCredits,
    p_description: `Purchased ${totalCredits} credits`,
    p_paddle_transaction_id: id,
    p_environment: env,
  });

  if (error) {
    console.error('Failed to add credits:', error);
  } else {
    console.log(`Added ${totalCredits} credits for user ${userId}. New balance: ${result}`);
  }
}
