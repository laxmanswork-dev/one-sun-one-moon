import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

// Every page is prerendered at build time (no ISR or revalidation), so serve that output as-is.
// Rendering inside the Worker instead would lose build-time file checks, such as the hero
// backdrop detection and the Open Graph font, because Workers have no project filesystem.
const config = defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
})

export default {
  ...config,
  // `npm run build` is the OpenNext build itself (so Cloudflare's default build step
  // produces .open-next/); the adapter runs the plain Next.js build through this script.
  buildCommand: 'npm run build:next',
}
