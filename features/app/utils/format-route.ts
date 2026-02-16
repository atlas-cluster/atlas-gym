export function formatRoute(route: string) {
  switch (route) {
    default:
      return 'Dashboard'
    case '/courses':
      return 'Courses'
    case '/reservations':
      return 'Reservations'
    case '/equipment':
      return 'Equipment'
    case '/rooms':
      return 'Rooms'
    case '/subscription':
      return 'Subscription'
    case '/members':
      return 'Members'
    case '/plans':
      return 'Plans'
    case '/audit-logs':
      return 'Audit Logs'
  }
}
