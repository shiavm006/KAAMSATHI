"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import SidebarLayout from "@/components/sidebar-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Briefcase, Bell, TrendingUp, Bookmark, Eye, Users, Calendar, AlertCircle } from "lucide-react"
import { mockJobs } from "@/data/mock-data"
import JobCard from "@/components/job-card"
import RecommendedJobs from "@/components/recommended-jobs"
import SavedJobs from "@/components/saved-jobs"
import JobAlerts from "@/components/job-alerts"
import EmployerJobManagement from "@/components/employer-job-management"
import Link from "next/link"

export default function JobsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [jobType, setJobType] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [filteredJobs, setFilteredJobs] = useState(mockJobs)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    let results = [...mockJobs]

    // Apply filters
    if (searchTerm) {
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (location) {
      results = results.filter((job) => job.location.includes(location))
    }

    if (jobType) {
      results = results.filter((job) => job.type === jobType)
    }

    // Sort results
    switch (sortBy) {
      case "date":
        results.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
        break
      case "salary_high":
        results.sort((a, b) => {
          const aMatch = a.salary.match(/₹(\d+,?\d*)/)
          const bMatch = b.salary.match(/₹(\d+,?\d*)/)
          const aValue = aMatch ? Number.parseInt(aMatch[1].replace(",", "")) : 0
          const bValue = bMatch ? Number.parseInt(bMatch[1].replace(",", "")) : 0
          return bValue - aValue
        })
        break
      case "relevance":
      default:
        // Keep original order for relevance
        break
    }

    setFilteredJobs(results)
  }, [searchTerm, location, jobType, sortBy])

  if (!user) {
    return null
  }

  const workerTabs = [
    { value: "all", label: "All Jobs", icon: Briefcase },
    { value: "recommended", label: "Recommended", icon: TrendingUp },
    { value: "saved", label: "Saved Jobs", icon: Bookmark },
    { value: "alerts", label: "Job Alerts", icon: Bell },
  ]

  const employerTabs = [
    { value: "all", label: "All Jobs", icon: Eye },
    { value: "manage", label: "My Jobs", icon: Briefcase },
    { value: "analytics", label: "Analytics", icon: TrendingUp },
  ]

  const tabs = user.role === "worker" ? workerTabs : employerTabs

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.role === "worker" ? "Find Jobs" : "Job Management"}
            </h1>
            <p className="text-gray-600">
              {user.role === "worker"
                ? "Discover opportunities that match your skills and preferences"
                : "Manage your job postings and track applications"}
            </p>
          </div>
          {user.role === "employer" && (
            <Link href="/post-job">
              <Button className="bg-blue-500 hover:bg-blue-600">Post New Job</Button>
            </Link>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search jobs by title, company, or keywords..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                      <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Date (newest)</SelectItem>
                      <SelectItem value="salary_high">Salary (high to low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Job Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{filteredJobs.length}</p>
                      <p className="text-sm text-gray-600">Jobs Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">1.2k</p>
                      <p className="text-sm text-gray-600">Active Employers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">85%</p>
                      <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">24</p>
                      <p className="text-sm text-gray-600">New Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {searchTerm || location || jobType ? "Search Results" : "Latest Jobs"}
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
                </p>
              </div>

              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                    <p className="text-gray-500 mb-4">
                      Try adjusting your search criteria or check back later for new opportunities.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setLocation("")
                        setJobType("")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {user.role === "worker" && (
            <>
              <TabsContent value="recommended">
                <RecommendedJobs />
              </TabsContent>

              <TabsContent value="saved">
                <SavedJobs />
              </TabsContent>

              <TabsContent value="alerts">
                <JobAlerts />
              </TabsContent>
            </>
          )}

          {user.role === "employer" && (
            <>
              <TabsContent value="manage">
                <EmployerJobManagement />
              </TabsContent>

              <TabsContent value="analytics">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Performance Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Analytics dashboard coming soon...</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </SidebarLayout>
  )
}
