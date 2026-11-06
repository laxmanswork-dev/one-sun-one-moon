import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

// Every page is prerendered at build time (no ISR or revalidation), so serve that output as-is.
// Rendering inside the Worker instead would lose build-time file checks, such as the hero
// backdrop detection and the Open Graph font, because Workers have no project filesystem.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
})
