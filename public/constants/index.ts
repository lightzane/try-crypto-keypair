/** For generating and import */
export const ECDSA_ALGO: EcKeyAlgorithm = {
  name: 'ECDSA', // Elliptic Curve Digital Signature Algorithm
  namedCurve: 'P-256',
}

/** For signing and verifying */
export const ECDSA_PARAMS: EcdsaParams = {
  name: 'ECDSA',
  hash: { name: 'SHA-256' },
}
