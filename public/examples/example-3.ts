import axios from 'axios'
import {
  exportPublicKeyAsJwk,
  generateKeypair,
  privateKeySign,
} from '~/utils/crypto-ecdsa'

export async function simulateUnmatchedPairs() {
  // Generate a key pair (private and public keys)
  const keyPairA = await generateKeypair()
  const keyPairB = await generateKeypair()

  // Export the public key as JWK to send to the server
  const publicJwkA = await exportPublicKeyAsJwk(keyPairA.publicKey)
  const publicJwkB = await exportPublicKeyAsJwk(keyPairB.publicKey)

  // base64 Encode jwk to string to be sent to server later
  const publicJwkStringA = window.btoa(JSON.stringify(publicJwkA))
  const publicJwkStringB = window.btoa(JSON.stringify(publicJwkB))

  // Request a challenge from the server
  const challengeResponse = await axios.post('/api/challenge')
  const base64Challenge: string = challengeResponse.data.challenge

  // Decode base64 challenge to Uint8Array (In Node.js, equivalent is Buffer.from(..., 'base64'))
  const challenge = Uint8Array.from(window.atob(base64Challenge), (c) =>
    c.charCodeAt(0)
  )

  // Sign the challenge with the private key
  const signatureA = await privateKeySign(keyPairA.privateKey, challenge)

  // base64 Encode signature to send to server
  const base64Signature = window.btoa(
    String.fromCharCode(...new Uint8Array(signatureA))
    // TypeScript Notes:
    // Type 'Uint8Array<ArrayBuffer>' can only be iterated through
    // when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.ts(2802)
  )

  // Send the signature and public key to the server for verification
  const verificationResponse = await axios.post('/api/verify-signature', {
    publicKeyJwk: publicJwkStringB,
    signature: base64Signature,
    challenge: base64Challenge, // OPTIONAL IF server keeps track of challenges per client session
  })

  console.log(
    `
    (Client & Server) 
    2 Key Pairs Generated
    Server Challenge
    Client Signing with KeyPair (Private Key) A
    Server Verifying with KeyPair (Public Key) B

    Result: ${verificationResponse.data.isValid}
    `
  )
}
