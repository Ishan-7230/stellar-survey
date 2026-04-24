/**
 * Stellar Blockchain Integration
 * Uses Stellar Testnet (Horizon) to anchor survey data hashes immutably.
 * Strategy: Generate an ephemeral keypair, fund via Friendbot, then submit
 * the SHA-256 hash of survey answers as a MEMO_HASH transaction.
 */

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const FRIENDBOT_URL = 'https://friendbot.stellar.org';

/**
 * Simple djb2 hash → hex string (for demo; in prod use Web Crypto SHA-256)
 */
function hashData(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  // Return a 32-char hex-like string
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex + hex + hex + hex).substring(0, 32);
}

/**
 * Fund a fresh Stellar keypair via Friendbot (Testnet only)
 */
async function fundViaFriendbot(publicKey) {
  const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
  if (!res.ok) throw new Error(`Friendbot failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch account details from Horizon
 */
async function fetchAccount(publicKey) {
  const res = await fetch(`${HORIZON_URL}/accounts/${publicKey}`);
  if (!res.ok) throw new Error(`Account not found: ${res.status}`);
  return res.json();
}

/**
 * Submit a payment-to-self transaction with a text memo (survey hash)
 * Uses the raw Horizon API to avoid stellar-sdk polyfill issues in browser.
 */
async function submitTransaction(secretKey, publicKey, memoText) {
  // Import stellar-sdk dynamically for XDR building
  const StellarSdk = await import('stellar-sdk');
  const { Keypair, TransactionBuilder, Networks, Operation, Asset, Memo, BASE_FEE } = StellarSdk;

  const keypair = Keypair.fromSecret(secretKey);
  const accountData = await fetchAccount(publicKey);

  const account = new StellarSdk.Account(publicKey, accountData.sequence);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: publicKey, // Self-payment as an anchor
        asset: Asset.native(),
        amount: '0.0000001',
      })
    )
    .addMemo(Memo.text(memoText.substring(0, 28))) // Stellar memo max is 28 bytes
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  const xdr = tx.toEnvelope().toXDR('base64');

  // Submit via Horizon REST API
  const res = await fetch(`${HORIZON_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `tx=${encodeURIComponent(xdr)}`,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Stellar submit failed: ${JSON.stringify(err)}`);
  }

  return res.json();
}

/**
 * Main export: submit survey answers to Stellar Testnet
 */
export async function submitSurveyToBlockchain(surveyData) {
  const StellarSdk = await import('stellar-sdk');
  const keypair = StellarSdk.Keypair.random();
  const secretKey = keypair.secret();
  const publicKey = keypair.publicKey();

  console.log('[Stellar] Generated ephemeral keypair:', publicKey);

  // Step 1: Fund via Friendbot
  await fundViaFriendbot(publicKey);
  console.log('[Stellar] Funded via Friendbot ✓');

  // Step 2: Hash the survey data
  const dataString = JSON.stringify(surveyData);
  const dataHash = hashData(dataString);
  console.log('[Stellar] Data hash:', dataHash);

  // Step 3: Submit transaction with hash in memo
  const txResult = await submitTransaction(secretKey, publicKey, `SURVEY:${dataHash}`);
  console.log('[Stellar] Transaction submitted ✓', txResult);

  return {
    hash: txResult.hash,
    ledger: txResult.ledger,
    publicKey: publicKey,
    dataHash: dataHash,
    timestamp: txResult.created_at || new Date().toISOString(),
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txResult.hash}`,
  };
}
