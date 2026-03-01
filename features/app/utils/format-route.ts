export function formatRoute(route: string) {
  switch (route) {
    default:
      return 'Dashboard'
    case '/courses':
      return 'Courses'
    case '/bookings':
      return 'Bookings'
    case '/equipment':
      return 'Equipment'
    case '/rooms':
      return 'Rooms'
    case '/subscription':
      return 'Subscription'
    case '/trainers/members':
      return 'Members'
    case '/trainers/courses':
      return 'Courses'
    case '/trainers/plans':
      return 'Plans'
    case '/trainers/audit-logs':
      return 'Audit Logs'
  }
}
