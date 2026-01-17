import { ECDSA_ALGO, ECDSA_PARAMS } from '~/constants'

export async function generateKeypair(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    ECDSA_ALGO, // Algorithm (for generating / importing)
    false, // Not extractable (private key cannot be exported, public key can be)
    ['sign', 'verify']
  )
}

export async function exportPublicKeyAsJwk(key: CryptoKey): Promise<JsonWebKey> {
  return window.crypto.subtle.exportKey('jwk', key)
}

export async function importPublicJwkAsKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return window.crypto.subtle.importKey(
    'jwk', // format
    jwk, // key data
    ECDSA_ALGO, // Algorithm (for generating / importing)
    true, // Extractable
    ['verify']
  )
}

export async function privateKeySign(key: CryptoKey, data: Uint8Array<ArrayBuffer>): Promise<ArrayBuffer> {
  return window.crypto.subtle.sign(ECDSA_PARAMS, key, data)
}

export async function publicKeyVerify(key: CryptoKey, signature: ArrayBuffer, data: Uint8Array<ArrayBuffer>): Promise<boolean> {
  return window.crypto.subtle.verify(ECDSA_PARAMS, key, signature, data)
}
