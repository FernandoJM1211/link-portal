import { checkDatabaseStatus } from '../../services/database-status.service'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  return {
    success: true,
    data: await checkDatabaseStatus(),
  }
})
