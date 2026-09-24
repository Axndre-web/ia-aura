import { SecretProvider } from '../secrets.js';
import { PayPalProvider } from './paypal.js';
import { StripeProvider } from './stripe.js';
import { CryptoReadOnlyProvider } from './crypto.js';
import { ComputeNodeProvider } from './compute-node.js';
import { RunPodProvider } from './runpod.js';

export function createProviders() {
  const secrets = new SecretProvider();
  return {
    secrets,
    paypal: new PayPalProvider(secrets),
    stripe: new StripeProvider(secrets),
    crypto: new CryptoReadOnlyProvider(secrets),
    compute: new ComputeNodeProvider(secrets),
    runpod: new RunPodProvider(secrets)
  };
}
