# Crypto KeyPair

Exploring the "KeyPair" (**ECDSA** algorithm with **SHA-256** and curve of **P-256**) of Web Crypto API to verify ownership and/or browser identity.

Private key is binded in the browser when stored in IndexedDB (`extractable: false`)
while Public key is exported as **JWK** and can be extracted and shared.

Server will send challenge (256-bits or 32 random bytes) that Client's private key will sign.

The signature will then send back to Server.

Server will verify the signature using the Public key along with the same challenge that was send to the Client.

> Note: Client-only challenge can be done but it is more recommended for the Server to handle creating the challenge.

## Examples

- [Example 1](./public/examples/example-1.ts) - Client only
- [Example 2](./public/examples/example-2.ts) - Client and Server
- [Example 3](./public/examples/example-3.ts) - Same with #2 but simulating invalid / mismatched keypairs.

## Getting Started

```bash
pnpm install
pnpm dev
```

**Open in browser and see console for output**

```

example-1.ts:20
    (Client Only)
    Full Flow Key Pair Generation, "Client Challenge", Signing, Verifying

    Result: true

example-2.ts:87
    (Client & Server)
    Client Key Pair Generation
    Server Challenge
    Client Signing
    Server Verifying

    Result: true

example-3.ts:48
    (Client & Server)
    2 Key Pairs Generated
    Server Challenge
    Client Signing with KeyPair (Private Key) A
    Server Verifying with KeyPair (Public Key) B

    Result: false
```

## Jump to utilities

- [crypto-ecdsa.ts](./public/utils/crypto-ecdsa.ts) - Web Crypto API (generate, import, sign, verify)

### Optional utilities

- [open-idb.ts](./public/utils/open-idb.ts) - Initialization / setup IDB and store
- [indexed-idb.ts](./public/utils/indexed-idb.ts) - IDB operations, read, put (upsert), and delete

## Developer Notes

In `tsconfig.json` we require the following to resolve **TypeScript errors**

```json
{
  "target": "esnext",
  "moduleResolution": "node"
}
```

**TypeScript errors**

```ts
const base64Signature = window.btoa(
  String.fromCharCode(...new Uint8Array(signature))

  // Type 'Uint8Array<ArrayBuffer>' can only be iterated through
  // when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.ts(2802)
)
```
