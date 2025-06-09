"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import SidebarLayout from "@/components/sidebar-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, CheckCircle, XCircle, Eye, Calendar, MapPin, DollarSign, Search, Filter, FileText } from "lucide-react"
import Link from "next/link"
import QuickMessageButton from "@/components/quick-message-button"

interface Application {
  id: number
  jobId: number
  jobTitle: string
  company: string
  appliedDate: string
  status: string
  expectedSalary?: string
  location?: string
  type?: string
  employerId?: string
  employerName?: string
}

export default function ApplicationsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (user) {
      // Load applications from localStorage (mock database)
      const savedApplications = JSON.parse(localStorage.getItem("user_applications") || "[]")
      const userApplications = savedApplications.filter((app: Application) => app.userId === user.id)

      // Add mock status updates for demonstration
      const applicationsWithStatus = userApplications.map((app: Application) => ({
        ...app,
        status: getRandomStatus(),
        location: "Mumbai, Maharashtra",
        type: "Full-time",
        employerId: "emp-" + Math.random().toString(36).substr(2, 9),
        employerName: app.company.split(" ")[0] + " HR",
      }))

      setApplications(applicationsWithStatus)
      setFilteredApplications(applicationsWithStatus)
    }
  }, [user])

  useEffect(() => {
    let filtered = applications

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.company.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((app) => {
        switch (activeTab) {
          case "pending":
            return ["submitted", "under_review"].includes(app.status)
          case "shortlisted":
            return app.status === "shortlisted"
          case "rejected":
            return app.status === "rejected"
          default:
            return true
        }
      })
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, statusFilter, activeTab])

  if (!user) {
    return null
  }

  const getRandomStatus = () => {
    const statuses = ["submitted", "under_review", "shortlisted", "rejected", "interview_scheduled"]
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "under_review":
        return "bg-yellow-100 text-yellow-800"
      case "shortlisted":
        return "bg-green-100 text-green-800"
      case "interview_scheduled":
        return "bg-purple-100 text-purple-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="h-4 w-4" />
      case "under_review":
        return <Eye className="h-4 w-4" />
      case "shortlisted":
      case "interview_scheduled":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getApplicationStats = () => {
    const total = applications.length
    const pending = applications.filter((app) => ["submitted", "under_review"].includes(app.status)).length
    const shortlisted = applications.filter((app) => app.status === "shortlisted").length
    const rejected = applications.filter((app) => app.status === "rejected").length

    return { total, pending, shortlisted, rejected }
  }

  const stats = getApplicationStats()

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600">Track the status of your job applications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                  <p className="text-2xl font-bold text-green-600">{stats.shortlisted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by job title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({stats.shortlisted})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredApplications.length > 0 ? (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{application.jobTitle}</h3>
                          <p className="text-gray-600 mb-2">{application.company}</p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {application.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Applied {new Date(application.appliedDate).toLocaleDateString()}
                            </div>
                            {application.expectedSalary && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {application.expectedSalary}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(application.status)}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1">{formatStatus(application.status)}</span>
                          </Badge>
                          <div className="flex gap-2">
                            <Link href={`/jobs/${application.jobId}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View Job
                              </Button>
                            </Link>
                            {(application.status === "shortlisted" || application.status === "interview_scheduled") &&
                              application.employerId &&
                              application.employerName && (
                                <QuickMessageButton
                                  recipientId={application.employerId}
                                  recipientName={application.employerName}
                                  recipientRole="employer"
                                  jobTitle={application.jobTitle}
                                  jobId={application.jobId}
                                  className="bg-green-500 hover:bg-green-600"
                                />
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div
                            className={`flex items-center gap-1 ${
                              ["submitted", "under_review", "shortlisted", "interview_scheduled", "rejected"].includes(
                                application.status,
                              )
                                ? "text-blue-600"
                                : ""
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Submitted
                          </div>
                          <div className="flex-1 h-px bg-gray-200"></div>
                          <div
                            className={`flex items-center gap-1 ${
                              ["under_review", "shortlisted", "interview_scheduled", "rejected"].includes(
                                application.status,
                              )
                                ? "text-yellow-600"
                                : "text-gray-400"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                ["under_review", "shortlisted", "interview_scheduled", "rejected"].includes(
                                  application.status,
                                )
                                  ? "bg-yellow-500"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            Under Review
                          </div>
                          <div className="flex-1 h-px bg-gray-200"></div>
                          <div
                            className={`flex items-center gap-1 ${
                              application.status === "shortlisted" || application.status === "interview_scheduled"
                                ? "text-green-600"
                                : application.status === "rejected"
                                  ? "text-red-600"
                                  : "text-gray-400"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                application.status === "shortlisted" || application.status === "interview_scheduled"
                                  ? "bg-green-500"
                                  : application.status === "rejected"
                                    ? "bg-red-500"
                                    : "bg-gray-300"
                              }`}
                            ></div>
                            {application.status === "rejected" ? "Rejected" : "Decision"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "You haven't applied to any jobs yet"}
                  </p>
                  <Link href="/jobs">
                    <Button className="bg-blue-500 hover:bg-blue-600">Browse Jobs</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  )
}
