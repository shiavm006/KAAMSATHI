"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import SidebarLayout from "@/components/sidebar-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Briefcase,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  MapPin,
  DollarSign,
  Building,
  Star,
  CheckCircle,
  BarChart3,
  Target,
  Award,
} from "lucide-react"
import { useRouter } from "next/navigation" // Import useRouter

export default function EmployerDashboard() {
  const { user } = useAuth()
  const router = useRouter() // Initialize useRouter
  const [activeTab, setActiveTab] = useState("overview")

  // Company Profile State
  const [companyName, setCompanyName] = useState("ABC Construction Services")
  const [industry, setIndustry] = useState("Construction")
  const [companyDescription, setCompanyDescription] = useState(
    "Leading construction company in Mumbai specializing in residential and commercial projects.",
  )

  // Employer-specific stats
  const employerStats = {
    activeJobs: 5,
    totalApplications: 127,
    hiredWorkers: 23,
    totalSpent: 185000,
    avgResponseTime: "2.3 days",
    companyRating: 4.6,
    jobsPosted: 15,
    successfulHires: 18,
  }

  const jobPostings = [
    {
      id: 1,
      title: "Plumber",
      status: "Active",
      applications: 5,
      postedDate: "2023-09-01",
      views: 89,
      salary: "₹600-800/day",
      type: "Contract",
    },
    {
      id: 2,
      title: "Electrician",
      status: "Active",
      applications: 3,
      postedDate: "2023-09-05",
      views: 45,
      salary: "₹500-700/day",
      type: "Part-time",
    },
    {
      id: 3,
      title: "Gardener",
      status: "Closed",
      applications: 7,
      postedDate: "2023-08-20",
      views: 67,
      salary: "₹400-500/day",
      type: "Full-time",
    },
  ]

  // Recent applications received
  const recentApplications = [
    {
      id: 1,
      jobTitle: "Construction Worker",
      applicantName: "Rajesh Kumar",
      experience: "5 years",
      rating: 4.8,
      appliedDate: "2024-01-16",
      status: "new",
      skills: ["Construction", "Masonry", "Safety"],
      location: "Mumbai, Maharashtra",
    },
    {
      id: 2,
      jobTitle: "Experienced Plumber",
      applicantName: "Amit Singh",
      experience: "3 years",
      rating: 4.5,
      appliedDate: "2024-01-15",
      status: "shortlisted",
      skills: ["Plumbing", "Pipe Fitting", "Repair"],
      location: "Mumbai, Maharashtra",
    },
    {
      id: 3,
      jobTitle: "Construction Worker",
      applicantName: "Suresh Patel",
      experience: "7 years",
      rating: 4.9,
      appliedDate: "2024-01-14",
      status: "interviewed",
      skills: ["Construction", "Electrical", "Painting"],
      location: "Mumbai, Maharashtra",
    },
  ]

  // Hired workers
  const hiredWorkers = [
    {
      id: 1,
      name: "Vikash Sharma",
      role: "Senior Plumber",
      hiredDate: "2024-01-01",
      project: "Office Complex Renovation",
      status: "active",
      rating: 4.9,
      totalEarned: "₹15,000",
      performance: "Excellent",
    },
    {
      id: 2,
      name: "Ravi Kumar",
      role: "Electrician",
      hiredDate: "2023-12-15",
      project: "Residential Wiring",
      status: "completed",
      rating: 4.7,
      totalEarned: "₹8,500",
      performance: "Good",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "closed":
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "new":
        return "bg-blue-100 text-blue-800"
      case "shortlisted":
        return "bg-purple-100 text-purple-800"
      case "interviewed":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <SidebarLayout>
      <div className="p-6">
        {/* Employer Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
              <p className="text-gray-600">Manage your job postings and find the right workers</p>
            </div>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => router.push("/post-job")}>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </div>

          {/* Company Profile Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Building className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{companyName}</h2>
                    <p className="text-gray-600">{industry} • Mumbai, Maharashtra</p>
                    <p className="text-gray-600">50-100 employees</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Company
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Award className="h-3 w-3 mr-1" />
                        Top Employer
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{employerStats.companyRating}</div>
                  <div className="text-sm text-gray-600 mb-1">Company Rating</div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Based on worker reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employer Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employerStats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employerStats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">Across all jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hired Workers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employerStats.hiredWorkers}</div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">Successful hires</p>
            </CardContent>
          </Card>
        </div>

        {/* Employer-specific tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="workers">Hired Workers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Company Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Manage your company information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <Input
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <Input placeholder="Enter industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                  <Textarea
                    placeholder="Describe your company"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button className="bg-blue-500 hover:bg-blue-600">Save Changes</Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Latest applications for your jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentApplications.slice(0, 3).map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{application.applicantName}</h3>
                          <p className="text-sm text-gray-500">{application.jobTitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-500">{application.rating}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{application.experience} exp</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                          <p className="text-xs text-gray-500 mt-1">{application.appliedDate}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Applications
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Job Performance</CardTitle>
                  <CardDescription>How your current jobs are performing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobPostings.slice(0, 3).map((job) => (
                      <div key={job.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{job.title}</h3>
                          <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {job.applications} applications
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {job.views} views
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Posted {job.postedDate}</span>
                          <Button size="sm" variant="outline">
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Jobs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Job Postings</h2>
                <p className="text-gray-600">Manage your active and past job postings</p>
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => router.push("/post-job")}>
                <Plus className="h-4 w-4 mr-2" />
                Post a New Job
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Posted Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobPostings.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{job.title}</div>
                            <div className="text-sm text-gray-500">
                              {job.salary} • {job.type}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                        </TableCell>
                        <TableCell>{job.applications}</TableCell>
                        <TableCell>{job.views}</TableCell>
                        <TableCell>{job.postedDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Applications</CardTitle>
                <CardDescription>Review and manage applications for your jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-lg">{application.applicantName}</h3>
                          <p className="text-gray-600">Applied for: {application.jobTitle}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              {application.rating} rating
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              {application.experience} experience
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {application.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Applied {application.appliedDate}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {application.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm">View Profile</Button>
                        <Button size="sm" variant="outline">
                          Shortlist
                        </Button>
                        <Button size="sm" variant="outline">
                          Schedule Interview
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hired Workers</CardTitle>
                <CardDescription>Workers you've hired and their current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hiredWorkers.map((worker) => (
                    <div key={worker.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-lg">{worker.name}</h3>
                          <p className="text-gray-600">{worker.role}</p>
                          <p className="text-sm text-gray-500">Project: {worker.project}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Hired {worker.hiredDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              Earned {worker.totalEarned}
                            </div>
                            <div className="flex items-center gap-1">
                              <BarChart3 className="h-4 w-4" />
                              {worker.performance}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(worker.status)}>{worker.status}</Badge>
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm">{worker.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          Message
                        </Button>
                        <Button size="sm" variant="outline">
                          Rate & Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hiring Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Jobs Posted</span>
                      <span className="font-bold">{employerStats.jobsPosted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Successful Hires</span>
                      <span className="font-bold">{employerStats.successfulHires}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response Time</span>
                      <span className="font-bold">{employerStats.avgResponseTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Spent</span>
                      <span className="font-bold">₹{employerStats.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Cost per Hire</span>
                      <span className="font-bold">
                        ₹{Math.round(employerStats.totalSpent / employerStats.successfulHires).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Company Rating</span>
                      <span className="font-bold">{employerStats.companyRating}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worker Retention</span>
                      <span className="font-bold">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  )
}
