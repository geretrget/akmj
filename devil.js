const {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');
const bip39 = require('bip39');
const { derivePath } = require('ed25519-hd-key');
const { createMint } = require('@solana/spl-token');
const prompt = require('prompt-sync')();

const DEVNET_URL = 'https://devnet.sonic.game/';
const connection = new Connection(DEVNET_URL, 'confirmed');

async function createToken(mintAuthority) {
  const mint = await createMint(connection, mintAuthority, mintAuthority.publicKey, null, 9); // 9 is the decimal places for the token
  return mint;
}

async function getKeypairFromSeed(seedPhrase) {
  const seed = await bip39.mnemonicToSeed(seedPhrase);
  const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
  return Keypair.fromSeed(derivedSeed.slice(0, 32));
}

async function getBalance(publicKey) {
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

;(async () => {
  const seedPhrase = prompt('Please enter your seed phrase: ');
  if (!seedPhrase) {
    throw new Error('Seed phrase is required');
  }
  const fromKeypair = await getKeypairFromSeed(seedPhrase);

  for (let i = 0; i < 50; i++) {
    try {
      const balance = await getBalance(fromKeypair.publicKey);
      console.log(`Balance of ${fromKeypair.publicKey.toBase58()}: ${balance} SOL`);

      const mint = await createToken(fromKeypair);
      console.log(`Successfully created new token with mint address: ${mint.toBase58()}`);
    } catch (error) {
      console.error(`Failed to create token:`, error);
    }

    const delayTime = Math.floor(Math.random() * (60 - 5 + 1)) + 5; // Random delay between 5 and 60 seconds
    console.log(`Waiting for ${delayTime} seconds before creating the next token...`);
    await delay(delayTime * 1000); // Convert to milliseconds
  }
})();
