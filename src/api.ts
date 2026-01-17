import type { Express } from 'express'
import { webcrypto } from 'node:crypto'
import { ECDSA_ALGO, ECDSA_PARAMS } from '~/constants'

export async function API_ENDPOINTS(app: Express) {
  app.get('/api/hello', (_req, res) => {
    res.json({ message: 'Hello from the server!' })
  })

  app.post('/api/challenge', async (_req, res) => {
    const challenge = webcrypto.getRandomValues(new Uint8Array(32)) // 32 bytes random (256 bits)

    /**
     * Note: This base64 encoding equivalent in browser is:
     * ```ts
     * const base64Challenge = window.btoa(
     *   String.fromCharCode(...new Uint8Array(challenge))
     * )
     * ```
     *
     * This ensures that the byte values are correctly converted to characters
     * before encoding to base64.
     *
     * However, in Node.js, we can use Buffer for base64 encoding directly.
     */
    const base64Challenge = Buffer.from(challenge).toString('base64')

    res.json({ challenge: base64Challenge })
  })

  app.post('/api/verify-signature', async (req, res) => {
    // Note: Must set express.json() middleware in server.ts to parse JSON body
    const body = req.body as {
      publicKeyJwk: string // base64 encoded (JSON string)
      signature: string // base64 encoded (per byte)
      challenge: string // base64 encoded (per byte)
    }

    const base64Jwk = body.publicKeyJwk

    // Decode base64 JWK
    let jwk: JsonWebKey

    try {
      const jwkJson = Buffer.from(base64Jwk, 'base64').toString('utf-8')
      jwk = JSON.parse(jwkJson)
    } catch {
      return res.status(400).json({ error: 'Invalid publicKeyJwk format' })
    }

    // Import the public key JWK
    let publicKey: webcrypto.CryptoKey

    try {
      publicKey = await webcrypto.subtle.importKey(
        'jwk', // format
        jwk, // key data
        ECDSA_ALGO, // Algorithm (for generating / importing)
        true, // Extractable
        ['verify']
      )
    } catch {
      return res.status(400).json({ error: 'Failed to import public key' })
    }

    // Decode signature and challenge from base64
    const signature = Buffer.from(body.signature, 'base64')
    const challenge = Buffer.from(body.challenge, 'base64')

    /*
      Note: In browser, the base64 decoding equivalent is:

      ```ts
      const signature = Uint8Array.from(
        window.atob(base64Signature), // when decoded gives a string (Iterable<String>) where each character represents a byte
        (c) => c.charCodeAt(0) // Convert each character to its byte value
      )
      const challenge = Uint8Array.from(
        window.atob(base64Challenge),
        (c) => c.charCodeAt(0)
      )
      ```

      This ensures that the base64 string is correctly decoded back to byte values.
      In detail and actual, the `codeCharAt(0)` returns a Unicode code unit,
      which for byte values (0-255) corresponds directly to the byte value.

      For example, the character with code unit 65 ('A') corresponds to the byte value 65.
      When outside this range, it may not correspond directly to a single byte,
      but since our data is byte-oriented, this approach works correctly.

      However, in Node.js, we can use Buffer for base64 decoding directly.
    */

    // Verify the signature
    const isValid = await webcrypto.subtle.verify(
      ECDSA_PARAMS, // Algorithm (for signing / verifying)
      publicKey,
      signature,
      challenge
    )

    res.json({ isValid })
  })
}
