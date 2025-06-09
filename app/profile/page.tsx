"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import SidebarLayout from "@/components/sidebar-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Building, MapPin, Users, Phone } from "lucide-react"

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!user) {
    return null
  }

  const recentJobPostings = [
    {
      id: 1,
      title: "Construction Worker",
      postedDate: "20 May 2023",
      applications: 15,
      status: "active",
    },
    {
      id: 2,
      title: "Electrician",
      postedDate: "18 May 2023",
      applications: 8,
      status: "active",
    },
  ]

  return (
    <SidebarLayout>
      <div className="p-6">
        <div className="mb-6">
          <p className="text-gray-600">Manage your profile information and settings.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-8 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="bg-blue-500 text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <p className="text-gray-600 capitalize mb-4">{user.role}</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{user.phone}</span>
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600">Edit Profile</Button>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Company</p>
                    <p className="text-gray-600">ABC Construction Services</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">Mumbai, Maharashtra</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Company Size</p>
                    <p className="text-gray-600">50-100 employees</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Job Postings */}
        <Card className="mt-8">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Job Postings</h3>
            <div className="space-y-4">
              {recentJobPostings.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">Posted on: {job.postedDate}</p>
                    <div className="mt-2">
                      <Badge className="bg-green-100 text-green-800">{job.applications} Applications</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline">View All Job Postings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}
