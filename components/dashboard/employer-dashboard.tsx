"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import SidebarLayout from "@/components/sidebar-layout"
import { EmployerStatsCards } from "./employer-stats-cards"
import { CompanyProfileCard } from "./company-profile-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import JobPostingAnalytics from "./job-posting-analytics" // Import the new component

// Mock data would ideally be moved to a central file like `data/mock-data.ts`
const jobPostings = [
  { id: 1, title: "Plumber", status: "Active", applications: 5, postedDate: "2023-09-01" },
  { id: 2, title: "Electrician", status: "Active", applications: 3, postedDate: "2023-09-05" },
  { id: 3, title: "Gardener", status: "Closed", applications: 7, postedDate: "2023-08-20" },
]

export default function EmployerDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  return (
    <SidebarLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
            <p className="text-gray-600">Manage your job postings and find the right workers.</p>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => router.push("/post-job")}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>

        <CompanyProfileCard />
        <EmployerStatsCards />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome!</CardTitle>
                <CardDescription>Here's a summary of your recent activity.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Overview content goes here. This could be another component.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="jobs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Management</CardTitle>
                <CardDescription>Manage your active and past job postings.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applications</TableHead>
                      <TableHead>Posted Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobPostings.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>
                          <Badge variant={job.status === "Active" ? "default" : "secondary"}>{job.status}</Badge>
                        </TableCell>
                        <TableCell>{job.applications}</TableCell>
                        <TableCell>{job.postedDate}</TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toast({ title: "Viewing Job", description: job.title })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toast({ title: "Editing Job", description: job.title })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() =>
                              toast({ title: "Deleting Job", description: job.title, variant: "destructive" })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
            <JobPostingAnalytics />
          </TabsContent>
          {/* Other TabsContent would follow */}
        </Tabs>
      </div>
    </SidebarLayout>
  )
}
