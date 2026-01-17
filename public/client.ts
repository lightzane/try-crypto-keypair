// ! [IMPORTANT]: To import module dependencies (e.g. 'axios')
// ! Then allow Vite to transform index.html (not express.static)
// ! --> see (vite-index-html.ts)
import axios from 'axios'
import { clientOnly_fullFlowKeyPair } from '~/examples/example-1'
import { serverChallenge } from '~/examples/example-2'
import { simulateUnmatchedPairs } from '~/examples/example-3'

document.addEventListener('DOMContentLoaded', start)

async function start() {
  await hello()

  // Full flow (Client only): Key Pair Generation, Signing, Verifying
  await clientOnly_fullFlowKeyPair()

  // Full flow (Client-Server): Key Pair Generation, Signing, Verifying with server challenge
  await serverChallenge()

  // Simulate Unmatched Key Pairs between Client and Server
  await simulateUnmatchedPairs()
}

async function hello() {
  const result = await axios.get('/api/hello')
  console.log(result.data)
}
