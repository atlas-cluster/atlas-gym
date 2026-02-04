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
    case '/members':
      return 'Members'
    case '/contracts':
      return 'Contracts'
    case '/trainers':
      return 'Trainers'
  }
}
