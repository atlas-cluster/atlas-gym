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
    case '/members':
      return 'Members'
    case '/my-courses':
      return 'My Courses'
    case '/course-templates':
      return 'Course Templates'
    case '/plans':
      return 'Plans'
    case '/analytics':
      return 'Analytics'
    case '/audit-logs':
      return 'Audit Logs'
  }
}
