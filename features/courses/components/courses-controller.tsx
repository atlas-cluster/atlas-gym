'use client'

import { CourseSessionDisplay } from '@/features/courses'
import { CourseSessionsView } from '@/features/courses/components/course-sessions-view'
import { MyBookingsView } from '@/features/courses/components/my-bookings-view'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs'

interface CoursesControllerProps {
  sessions: CourseSessionDisplay[]
  myBookings: CourseSessionDisplay[]
}

export function CoursesController({ sessions, myBookings }: CoursesControllerProps) {
  return (
    <Tabs defaultValue="browse">
      <TabsList>
        <TabsTrigger value="browse">Browse Sessions</TabsTrigger>
        <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
      </TabsList>
      <TabsContent value="browse">
        <CourseSessionsView initialData={sessions} />
      </TabsContent>
      <TabsContent value="my-bookings">
        <MyBookingsView initialData={myBookings} />
      </TabsContent>
    </Tabs>
  )
}
