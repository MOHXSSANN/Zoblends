import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const SUPABASE_URL = 'https://mhhagaztfurgivlspdss.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY

if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY env var')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const VIDEOS = [
  { local: 'public/0601.mp4',            remote: '0601.mp4' },
  { local: 'public/Zovid.mp4',           remote: 'Zovid.mp4' },
  { local: 'public/zo3d/Zo3dmap.mp4',    remote: 'zo3d/Zo3dmap.mp4' },
]

async function run() {
  // Create bucket if it doesn't exist
  const { error: bucketErr } = await supabase.storage.createBucket('videos', {
    public: true,
  })
  if (bucketErr && !bucketErr.message.includes('already exists')) {
    console.error('Bucket error:', bucketErr.message)
    process.exit(1)
  }
  console.log('✓ Bucket ready')

  for (const { local, remote } of VIDEOS) {
    const fullPath = join(root, local)
    if (!existsSync(fullPath)) {
      console.log(`⚠ Skipping ${local} (not found)`)
      continue
    }
    console.log(`Uploading ${local}...`)
    const file = readFileSync(fullPath)
    const { error } = await supabase.storage
      .from('videos')
      .upload(remote, file, { contentType: 'video/mp4', upsert: true })
    if (error) {
      console.error(`✗ ${remote}:`, error.message)
    } else {
      const { data } = supabase.storage.from('videos').getPublicUrl(remote)
      console.log(`✓ ${remote}\n  → ${data.publicUrl}`)
    }
  }
}

run()
