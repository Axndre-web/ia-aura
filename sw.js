import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { handleAIRequest } from './aiservice.js';
import { processStripeEvent } from './billingautomation.js';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.static('.'));

app.post('/api/generate', express.json(), handleAIRequest);

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
const sig = req.headers['stripe-signature'];
let event;

try {
event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
} catch (err) {
return res.status(400).send(`Webhook Error: ${err.message}`);
}

await processStripeEvent(event);
res.status(200).json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`[SISTEMA] Servidor activo en puerto ${PORT}`);
});