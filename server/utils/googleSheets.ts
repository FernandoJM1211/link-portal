import { JWT } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet'

export async function getGoogleDoc() {
  const config = useRuntimeConfig()
  if (!config.googleSheetId || !config.googleServiceAccountEmail || !config.googlePrivateKey) {
    return null
  }

  // Handle line breaks in private key
  const privateKey = config.googlePrivateKey.replace(/\\n/g, '\n')

  const serviceAccountAuth = new JWT({
    email: config.googleServiceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const doc = new GoogleSpreadsheet(config.googleSheetId, serviceAccountAuth)
  await doc.loadInfo()
  return doc
}

export async function fetchFromGoogleSheets() {
  const doc = await getGoogleDoc()
  if (!doc) return null

  // Sheet 1: Links (id, title, url, icon, isActive, order, isFeatured)
  let linksSheet = doc.sheetsByTitle['Links']
  if (!linksSheet) {
    linksSheet = await doc.addSheet({
      title: 'Links',
      headerValues: ['id', 'title', 'url', 'icon', 'isActive', 'order', 'isFeatured']
    })
  }

  // Sheet 2: Settings (key, value)
  let settingsSheet = doc.sheetsByTitle['Settings']
  if (!settingsSheet) {
    settingsSheet = await doc.addSheet({
      title: 'Settings',
      headerValues: ['key', 'value']
    })
  }

  const linkRows = await linksSheet.getRows()
  const links = linkRows.map(row => ({
    id: row.get('id') || '',
    title: row.get('title') || '',
    url: row.get('url') || '',
    icon: row.get('icon') || 'Globe',
    isActive: row.get('isActive') === 'true' || row.get('isActive') === true,
    order: Number(row.get('order') || 0),
    isFeatured: row.get('isFeatured') === 'true' || row.get('isFeatured') === true
  })).sort((a, b) => a.order - b.order)

  const settingRows = await settingsSheet.getRows()
  const settingsMap: Record<string, any> = {}
  for (const row of settingRows) {
    const key = row.get('key')
    const val = row.get('value')
    if (key) {
      try {
        settingsMap[key] = JSON.parse(val)
      } catch {
        settingsMap[key] = val
      }
    }
  }

  const profile = {
    name: settingsMap.name || 'Portal Resmi Unit Kami',
    bio: settingsMap.bio || 'Pusat informasi dan layanan resmi.',
    avatarUrl: settingsMap.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=UnitPortal',
    theme: settingsMap.theme || 'indigo',
    socials: settingsMap.socials || {
      instagram: '',
      whatsapp: '',
      website: '',
      youtube: '',
      email: ''
    }
  }

  return { profile, links }
}

export async function saveLinksToGoogleSheets(links: any[]) {
  const doc = await getGoogleDoc()
  if (!doc) return false

  let linksSheet = doc.sheetsByTitle['Links']
  if (!linksSheet) {
    linksSheet = await doc.addSheet({
      title: 'Links',
      headerValues: ['id', 'title', 'url', 'icon', 'isActive', 'order', 'isFeatured']
    })
  }

  await linksSheet.clearRows()
  const rows = links.map(l => ({
    id: l.id,
    title: l.title,
    url: l.url,
    icon: l.icon || 'Globe',
    isActive: String(l.isActive),
    order: String(l.order),
    isFeatured: String(!!l.isFeatured)
  }))

  if (rows.length > 0) {
    await linksSheet.addRows(rows)
  }
  return true
}

export async function saveProfileToGoogleSheets(profile: any) {
  const doc = await getGoogleDoc()
  if (!doc) return false

  let settingsSheet = doc.sheetsByTitle['Settings']
  if (!settingsSheet) {
    settingsSheet = await doc.addSheet({
      title: 'Settings',
      headerValues: ['key', 'value']
    })
  }

  await settingsSheet.clearRows()
  const rows = [
    { key: 'name', value: profile.name || '' },
    { key: 'bio', value: profile.bio || '' },
    { key: 'avatarUrl', value: profile.avatarUrl || '' },
    { key: 'theme', value: profile.theme || 'indigo' },
    { key: 'socials', value: JSON.stringify(profile.socials || {}) }
  ]
  await settingsSheet.addRows(rows)
  return true
}
