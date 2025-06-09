"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import SidebarLayout from "@/components/sidebar-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Briefcase, Calendar, Building, Users, CheckCircle } from "lucide-react"
import { mockJobs } from "@/data/mock-data"
import Link from "next/link"

export default function JobDetailPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = Number(params.id)

  const [job, setJob] = useState(mockJobs.find((j) => j.id === jobId))
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // Check if user has already applied (mock check)
    const applications = JSON.parse(localStorage.getItem("user_applications") || "[]")
    setHasApplied(applications.some((app: any) => app.jobId === jobId && app.userId === user?.id))
  }, [jobId, user?.id])

  if (!user || !job) {
    return null
  }

  const handleApply = () => {
    router.push(`/jobs/${jobId}/apply`)
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/jobs" className="hover:text-gray-700">
            Jobs
          </Link>
          <span>/</span>
          <span>{job.title}</span>
        </nav>

        {/* Job Header */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-gray-500" />
                <span className="text-lg text-gray-700">{job.company}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {job.type}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">{job.salary}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">{job.experienceLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700">Posted {new Date(job.postedDate).toLocaleDateString()}</span>
            </div>
          </div>

          {user.role === "worker" && (
            <div className="flex gap-3">
              {hasApplied ? (
                <Button disabled className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Applied
                </Button>
              ) : (
                <Button onClick={handleApply} className="bg-blue-500 hover:bg-blue-600">
                  Apply Now
                </Button>
              )}
              <Button variant="outline">Save Job</Button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{job.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li>• {job.experienceLevel} level experience required</li>
                  <li>• Must be available for {job.type.toLowerCase()} work</li>
                  <li>• Strong communication skills</li>
                  <li>• Ability to work independently and as part of a team</li>
                  <li>• Must have own transportation</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Company Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {job.company}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">50-100 employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{job.location}</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    A leading construction company with over 10 years of experience in residential and commercial
                    projects.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Applications</span>
                    <span className="text-sm font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Views</span>
                    <span className="text-sm font-medium">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Posted</span>
                    <span className="text-sm font-medium">{new Date(job.postedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  )
}
