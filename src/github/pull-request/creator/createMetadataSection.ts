import type { OutdatedPackage } from '../../../core'
import { toJSON } from '../../../json'
import { createPullRequestMetadata } from '../metadata'

export const createMetadataSection = (outdatedPackage: OutdatedPackage): string => {
  const metadata = createPullRequestMetadata([outdatedPackage])
  const json = toJSON(metadata, {
    pretty: true
  })
  return `<details>
<summary>Metadata</summary>

**Don't remove or edit this section because it will be used by npm-update-package.**

<div id="npm-update-package-metadata">

\`\`\`json
${json}
\`\`\`

</div>
</details>`
}
