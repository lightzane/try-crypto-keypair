import axios from 'axios'
import {
  exportPublicKeyAsJwk,
  generateKeypair,
  privateKeySign,
} from '~/utils/crypto-ecdsa'
import { useIndexedDB } from '~/utils/indexed-idb'
import { IIndexedDBConfig } from '~/utils/open-idb'

/**
 * The "KeyPair" In Web Crypto API,
 * generate, sign and verify using ECDSA algorithm
 * can all be done in Client-side.
 *
 * But for more realistic scenario,
 * the client would generate a key pair,
 * then send the public key to the server,
 * so that the server can verify signatures sent from the client.
 *
 * ### Client-only flow:
 * 1. Client generates a key pair (private and public keys)
 * 2. Client uses the private key to sign a challenge message
 * 3. Client uses the public key to verify the signature
 *
 * ### Client-Server flow:
 * 1. Client generates a key pair (private and public keys)
 * 2. Client exports the public key (as JWK) and sends it to the server
 * 3. Client requests the server to send a challenge message
 * 4. Server sends the challenge message to the client
 * 5. Client uses the private key to sign the challenge message
 * 6. Client sends the signature and public key to the server
 * 7. Server imports the public key (JWK) to a CryptoKey
 * 8. Server uses the public key to verify the signature
 *
 * Note: You can opt to store the private key in IndexedDB for persistence,
 * but for simplicity, this example does not include that part.
 *
 * Use-case: This flow is useful for authentication systems,
 * where the server needs to verify the identity of the client
 * without the client having to send sensitive private key information.
 * This enhances security by ensuring that private keys never leave the client side.
 * Useful when app doesn't have features like Login/Signup,
 * but still want to verify the client identity.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey
 */
export async function serverChallenge() {
  // Generate a key pair (private and public keys)
  const keyPair = await generateKeypair()

  // (Optional) Store the private key in IndexedDB for persistence
  await storePrivateKeyInIndexedDB(keyPair.privateKey)

  // Export the public key as JWK to send to the server
  const publicJwk = await exportPublicKeyAsJwk(keyPair.publicKey)

  // base64 Encode jwk to string to be sent to server later
  const publicJwkString = window.btoa(JSON.stringify(publicJwk))

  // Request a challenge from the server
  const challengeResponse = await axios.post('/api/challenge')
  const base64Challenge: string = challengeResponse.data.challenge

  // Decode base64 challenge to Uint8Array (In Node.js, equivalent is Buffer.from(..., 'base64'))
  const challenge = Uint8Array.from(window.atob(base64Challenge), (c) =>
    c.charCodeAt(0)
  )

  // Sign the challenge with the private key
  const signature = await privateKeySign(keyPair.privateKey, challenge)

  // base64 Encode signature to send to server
  const base64Signature = window.btoa(
    String.fromCharCode(...new Uint8Array(signature))
    // TypeScript Notes:
    // Type 'Uint8Array<ArrayBuffer>' can only be iterated through
    // when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.ts(2802)
  )

  // Send the signature and public key to the server for verification
  const verificationResponse = await axios.post('/api/verify-signature', {
    publicKeyJwk: publicJwkString,
    signature: base64Signature,
    challenge: base64Challenge, // OPTIONAL IF server keeps track of challenges per client session
  })

  console.log(
    `
    (Client & Server) 
    Client Key Pair Generation
    Server Challenge
    Client Signing
    Server Verifying

    Result: ${verificationResponse.data.isValid}
    `
  )
}

async function storePrivateKeyInIndexedDB(privateKey: CryptoKey) {
  const idbConfig: IIndexedDBConfig = {
    dbName: 'try-crypto-keypair-db',
    storeName: 'try-crypto-keypair-store',
  }

  const idb = useIndexedDB(idbConfig)
  await idb.putAsync('registration', { privateKey })
}
