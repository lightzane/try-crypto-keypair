import {
  generateKeypair,
  privateKeySign,
  publicKeyVerify,
} from '~/utils/crypto-ecdsa'

export async function clientOnly_fullFlowKeyPair() {
  // Generate a key pair (private and public keys)
  const keyPair = await generateKeypair()

  // Challenge message
  const challenge = window.crypto.getRandomValues(new Uint8Array(32)) // 32 bytes random (256 bits)

  // Private key is used to sign the challenge
  const signature = await privateKeySign(keyPair.privateKey, challenge)

  // Public key is used to verify the signature
  const isValid = await publicKeyVerify(keyPair.publicKey, signature, challenge)

  console.log(
    `
    (Client Only) 
    Full Flow Key Pair Generation, "Client Challenge", Signing, Verifying

    Result: ${isValid}
    `
  )
}
