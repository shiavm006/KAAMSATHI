"use client"
import { useAuth } from "@/contexts/auth-context"
import SidebarLayout from "@/components/sidebar-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, Clock, DollarSign, MapPin, Star, CheckCircle, XCircle, Eye, Calendar, Award } from "lucide-react"
import Link from "next/link" // Import Link

export default function WorkerDashboard() {
  const { user } = useAuth()

  // Worker-specific stats
  const workerStats = {
    totalApplications: 24,
    activeApplications: 8,
    completedJobs: 12,
    totalEarnings: 45000,
    profileViews: 156,
    rating: 4.8,
    profileCompletion: 75,
    skillsVerified: 5,
  }

  // Auto-matched jobs for workers
  const autoMatchedJobs = [
    {
      id: 1,
      title: "Landscaping Assistant",
      description: "Assist with landscaping projects, including planting, weeding, and lawn care.",
      requirements: "Experience preferred but not required.",
      location: "Mumbai, Maharashtra",
      type: "Part-time",
      salary: "₹400-600/day",
      match: 95,
      company: "Green Gardens Ltd",
      posted: "2 hours ago",
    },
    {
      id: 2,
      title: "Event Setup Crew",
      description: "Help set up and tear down events, including arranging tables, chairs, and decorations.",
      requirements: "Must be able to lift 50 lbs.",
      location: "Mumbai, Maharashtra",
      type: "Contract",
      salary: "₹500-700/day",
      match: 88,
      company: "Event Masters",
      posted: "5 hours ago",
    },
    {
      id: 3,
      title: "Warehouse Worker",
      description: "Loading and unloading trucks, organizing inventory, and maintaining warehouse cleanliness.",
      requirements: "Previous warehouse experience preferred.",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      salary: "₹15,000-18,000/month",
      match: 82,
      company: "LogiCorp Solutions",
      posted: "1 day ago",
    },
  ]

  // Recent applications
  const recentApplications = [
    {
      id: 1,
      jobTitle: "Construction Worker",
      company: "ABC Construction",
      location: "Mumbai, Maharashtra",
      appliedDate: "2024-01-15",
      status: "shortlisted",
      salary: "₹18,000/month",
    },
    {
      id: 2,
      jobTitle: "Plumber",
      company: "Home Services Ltd",
      location: "Delhi, NCR",
      appliedDate: "2024-01-12",
      status: "under_review",
      salary: "₹600/day",
    },
    {
      id: 3,
      jobTitle: "Electrician",
      company: "Power Solutions",
      location: "Bangalore, Karnataka",
      appliedDate: "2024-01-10",
      status: "rejected",
      salary: "₹500/day",
    },
  ]

  // Work history for workers
  const workHistory = [
    {
      id: 1,
      title: "Residential Plumbing",
      company: "Home Fix Services",
      completedDate: "2024-01-05",
      duration: "3 days",
      earnings: "₹2,400",
      rating: 5,
    },
    {
      id: 2,
      title: "Office Electrical Work",
      company: "Corporate Solutions",
      completedDate: "2023-12-28",
      duration: "5 days",
      earnings: "₹4,500",
      rating: 4,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-100 text-green-800"
      case "under_review":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <SidebarLayout>
      <div className="p-6">
        {/* Welcome Header with Worker Profile */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {user?.name}</h1>

          {/* Worker Profile Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-4 border-blue-500">
                    <AvatarFallback className="bg-blue-500 text-white text-xl font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                    <p className="text-gray-600">30 years old, 5 years experience</p>
                    <p className="text-gray-600">Skills: Landscaping, Event Setup, Warehouse</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified Worker
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Award className="h-3 w-3 mr-1" />
                        Top Rated
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">4.8</div>
                  <div className="text-sm text-gray-600 mb-1">Rating</div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Based on {workerStats.completedJobs} jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Worker Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workerStats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">+3 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workerStats.activeApplications}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{workerStats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workerStats.profileViews}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Auto-Matched Jobs Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Auto-Matched Jobs</h2>
              <p className="text-gray-600">Jobs that match your skills and preferences</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/jobs">View All Jobs</Link>
            </Button>
          </div>

          <div className="space-y-6">
            {autoMatchedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {job.match}% match
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{job.company}</p>
                      <p className="text-gray-700 mb-2">{job.description}</p>
                      <p className="text-gray-600 text-sm mb-3">{job.requirements}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {job.posted}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="bg-blue-500 hover:bg-blue-600" asChild>
                      <Link href={`/jobs/${job.id}/apply`}>Apply Now</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/jobs/${job.id}`}>View Details</Link>
                    </Button>
                    <Button variant="outline">Save Job</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Worker-specific tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="profile">Profile Progress</TabsTrigger>
            <TabsTrigger value="history">Work History</TabsTrigger>
            <TabsTrigger value="skills">Skills & Certifications</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Track the status of your job applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{application.jobTitle}</h3>
                        <p className="text-sm text-gray-500">{application.company}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {application.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {application.salary}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Applied: {application.appliedDate}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(application.status)}>
                          <span className="capitalize">{application.status.replace("_", " ")}</span>
                        </Badge>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
                <CardDescription>Complete your profile to get better job matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Profile Completion</span>
                    <span className="text-sm font-medium">{workerStats.profileCompletion}%</span>
                  </div>
                  <Progress value={workerStats.profileCompletion} className="w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Basic Information</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Skills Added</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Portfolio Missing</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Complete Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Work History</CardTitle>
                <CardDescription>Your completed jobs and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workHistory.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-gray-500">{job.company}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Completed: {job.completedDate}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Duration: {job.duration}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{job.earnings}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < job.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">({job.rating})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills & Certifications</CardTitle>
                <CardDescription>Manage your skills and get verified</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Landscaping</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Event Setup</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Warehouse</span>
                        <XCircle className="h-4 w-4 text-gray-400" />
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Add New Skill
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  )
}
