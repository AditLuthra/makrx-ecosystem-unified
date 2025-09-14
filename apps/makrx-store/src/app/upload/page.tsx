import dynamicImport from 'next/dynamic'

export const dynamic = 'force-dynamic'

const UploadClient = dynamicImport(() => import('./page.client'), { ssr: false })

export default UploadClient
