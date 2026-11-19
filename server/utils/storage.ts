import fs from 'node:fs/promises'
import path from 'node:path'
import {
  fetchFromGoogleSheets,
  saveLinksToGoogleSheets,
  saveProfileToGoogleSheets
} from './googleSheets'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'data.json')
const DEFAULT_DATA_FILE = path.join(DATA_DIR, 'default-data.json')

export interface LinkItem {
  id: string
  title: string
  url: string
  icon: string
  isActive: boolean
  order: number
  isFeatured?: boolean
}

export interface ProfileData {
  name: string
  bio: string
  avatarUrl: string
  theme: string
  socials: {
    instagram?: string
    whatsapp?: string
    website?: string
    youtube?: string
    email?: string
  }
}

export interface AppData {
  profile: ProfileData
  links: LinkItem[]
}

// In-memory cache for fast response time
let cachedData: AppData | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60 * 1000 // 1 minute

async function readLocalFile(): Promise<AppData> {
  try {
    await fs.access(DATA_FILE)
    const content = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    // If data.json doesn't exist, read from default-data.json and write to data.json
    const defaultContent = await fs.readFile(DEFAULT_DATA_FILE, 'utf-8')
    await fs.writeFile(DATA_FILE, defaultContent, 'utf-8')
    return JSON.parse(defaultContent)
  }
}

async function writeLocalFile(data: AppData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export async function getStorageData(forceRefresh = false): Promise<AppData> {
  const now = Date.now()
  if (!forceRefresh && cachedData && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedData
  }

  const config = useRuntimeConfig()
  const hasGoogleConfig = Boolean(
    config.googleSheetId && config.googleServiceAccountEmail && config.googlePrivateKey
  )

  if (hasGoogleConfig) {
    try {
      const sheetsData = await fetchFromGoogleSheets()
      if (sheetsData) {
        cachedData = sheetsData as AppData
        cacheTimestamp = now
        return cachedData
      }
    } catch (err) {
      console.error('Failed to fetch from Google Sheets, falling back to local file:', err)
    }
  }

  // Fallback to local storage
  cachedData = await readLocalFile()
  cacheTimestamp = now
  return cachedData
}

export async function saveAllLinks(links: LinkItem[]): Promise<void> {
  const current = await getStorageData(true)
  current.links = links
  cachedData = current
  cacheTimestamp = Date.now()

  const config = useRuntimeConfig()
  const hasGoogleConfig = Boolean(
    config.googleSheetId && config.googleServiceAccountEmail && config.googlePrivateKey
  )

  if (hasGoogleConfig) {
    try {
      await saveLinksToGoogleSheets(links)
    } catch (err) {
      console.error('Failed to save links to Google Sheets:', err)
    }
  }

  await writeLocalFile(current)
}

export async function saveProfile(profile: ProfileData): Promise<void> {
  const current = await getStorageData(true)
  current.profile = profile
  cachedData = current
  cacheTimestamp = Date.now()

  const config = useRuntimeConfig()
  const hasGoogleConfig = Boolean(
    config.googleSheetId && config.googleServiceAccountEmail && config.googlePrivateKey
  )

  if (hasGoogleConfig) {
    try {
      await saveProfileToGoogleSheets(profile)
    } catch (err) {
      console.error('Failed to save profile to Google Sheets:', err)
    }
  }

  await writeLocalFile(current)
}
