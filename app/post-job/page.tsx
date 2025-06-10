"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import SidebarLayout from "@/components/sidebar-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Briefcase, DollarSign, Tag, ListChecks, CalendarDays } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { mockJobs } from "@/data/mock-data" // For skills suggestions or other data

interface JobFormData {
  title: string
  companyName: string
  location: string
  jobType: string // e.g., Full-time, Part-time, Contract, Temporary
  salaryMin: string
  salaryMax: string
  salaryType: string // e.g., per day, per month, per hour
  description: string
  responsibilities: string
  requirements: string
  skills: string[]
  experienceLevel: string // e.g., Entry-level, Mid-level, Senior-level
  postedDate: string
}

const initialJobFormData: JobFormData = {
  title: "",
  companyName: "",
  location: "",
  jobType: "Full-time",
  salaryMin: "",
  salaryMax: "",
  salaryType: "per day",
  description: "",
  responsibilities: "",
  requirements: "",
  skills: [],
  experienceLevel: "Entry-level",
  postedDate: new Date().toISOString().split("T")[0],
}

// Sample skills for suggestions - in a real app, this might come from a DB
const allSkills = [
  "Construction",
  "Plumbing",
  "Electrical Work",
  "Painting",
  "Carpentry",
  "Driving",
  "Cooking",
  "Cleaning",
  "Gardening",
  "Welding",
  "Masonry",
]

export default function PostJobPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<JobFormData>(initialJobFormData)
  const [currentSkill, setCurrentSkill] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (user?.role !== "employer") {
      toast({
        title: "Access Denied",
        description: "Only employers can post jobs.",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: keyof JobFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = () => {
    if (currentSkill && !formData.skills.includes(currentSkill)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, currentSkill] }))
      setCurrentSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Enhanced Validation
    const errors = []
    if (!formData.title.trim()) errors.push("Job Title is required.")
    if (!formData.location.trim()) errors.push("Location is required.")
    if (!formData.description.trim()) errors.push("Job Description is required.")
    if (formData.salaryMin && isNaN(Number(formData.salaryMin))) errors.push("Minimum Salary must be a number.")
    if (formData.salaryMax && isNaN(Number(formData.salaryMax))) errors.push("Maximum Salary must be a number.")
    if (formData.salaryMin && formData.salaryMax && Number(formData.salaryMin) > Number(formData.salaryMax)) {
      errors.push("Maximum Salary must be greater than Minimum Salary.")
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <ul className="list-disc pl-5">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newJob = {
      id: Date.now(), // Simple ID generation for demo
      employerId: user?.id,
      company: formData.companyName || user?.name || "KaamSathi Employer", // Use employer name if company not set
      status: "active", // Default status
      applicantCount: 0,
      viewCount: 0,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 30 days
      ...formData,
      salary: `${formData.salaryMin}${formData.salaryMax ? "-" + formData.salaryMax : ""} ${formData.salaryType}`, // Combine salary fields
    }

    // Save to localStorage (mock database)
    const existingJobs = JSON.parse(localStorage.getItem("posted_jobs") || "[]")
    existingJobs.push(newJob)
    localStorage.setItem("posted_jobs", JSON.stringify(existingJobs))

    // Also add to mockJobs for immediate reflection in other parts of the app if needed for demo
    // In a real app, this would be handled by data fetching and state management
    mockJobs.unshift({
      ...newJob,
      postedDate: newJob.postedDate, // ensure field name matches
    })

    setIsSubmitting(false)
    toast({
      title: "Job Posted Successfully!",
      description: `Your job "${formData.title}" is now live.`,
    })
    setFormData(initialJobFormData) // Reset form
    router.push("/dashboard") // Or a page showing employer's jobs
  }

  if (!user || user.role !== "employer") {
    return (
      <SidebarLayout>
        <div className="p-6 text-center">Loading or access denied...</div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="shadow-xl">
          <CardHeader className="bg-gray-50 p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <PlusCircle className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">Post a New Job</CardTitle>
                <CardDescription className="text-gray-600">
                  Fill in the details to find the right talent.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                  Job Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title" className="font-medium">
                      Job Title *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Construction Worker, Plumber"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName" className="font-medium">
                      Company Name (Optional)
                    </Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Your Company Name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location" className="font-medium">
                    Location *
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Mumbai, Maharashtra"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="jobType" className="font-medium">
                    Job Type
                  </Label>
                  <Select
                    name="jobType"
                    value={formData.jobType}
                    onValueChange={(value) => handleSelectChange("jobType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Temporary">Temporary</SelectItem>
                      <SelectItem value="Daily Wage">Daily Wage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </section>

              {/* Salary Information */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Salary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="salaryMin" className="font-medium">
                      Minimum Salary
                    </Label>
                    <Input
                      id="salaryMin"
                      name="salaryMin"
                      type="number"
                      value={formData.salaryMin}
                      onChange={handleChange}
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax" className="font-medium">
                      Maximum Salary (Optional)
                    </Label>
                    <Input
                      id="salaryMax"
                      name="salaryMax"
                      type="number"
                      value={formData.salaryMax}
                      onChange={handleChange}
                      placeholder="e.g., 800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryType" className="font-medium">
                      Salary Type
                    </Label>
                    <Select
                      name="salaryType"
                      value={formData.salaryType}
                      onValueChange={(value) => handleSelectChange("salaryType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per day">Per Day</SelectItem>
                        <SelectItem value="per week">Per Week</SelectItem>
                        <SelectItem value="per month">Per Month</SelectItem>
                        <SelectItem value="per hour">Per Hour</SelectItem>
                        <SelectItem value="fixed project">Fixed Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Description and Responsibilities */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-purple-500" />
                  Description & Requirements
                </h3>
                <div>
                  <Label htmlFor="description" className="font-medium">
                    Job Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Detailed description of the job..."
                    rows={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="responsibilities" className="font-medium">
                    Key Responsibilities (Optional)
                  </Label>
                  <Textarea
                    id="responsibilities"
                    name="responsibilities"
                    value={formData.responsibilities}
                    onChange={handleChange}
                    placeholder="List key responsibilities, one per line..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="requirements" className="font-medium">
                    Requirements (Optional)
                  </Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="List specific requirements or qualifications, one per line..."
                    rows={3}
                  />
                </div>
              </section>

              {/* Skills and Experience */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-orange-500" />
                  Skills & Experience
                </h3>
                <div>
                  <Label htmlFor="skills" className="font-medium">
                    Skills (add up to 10)
                  </Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="currentSkill"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      placeholder="Enter a skill"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddSkill()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddSkill}
                      variant="outline"
                      disabled={formData.skills.length >= 10}
                    >
                      Add Skill
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 text-xs font-bold hover:text-red-500"
                        >
                          &times;
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Suggested:{" "}
                    {allSkills
                      .filter((s) => !formData.skills.includes(s))
                      .slice(0, 5)
                      .join(", ")}
                  </p>
                </div>
                <div>
                  <Label htmlFor="experienceLevel" className="font-medium">
                    Experience Level
                  </Label>
                  <Select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onValueChange={(value) => handleSelectChange("experienceLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entry-level">Entry-level (0-1 year)</SelectItem>
                      <SelectItem value="Mid-level">Mid-level (2-5 years)</SelectItem>
                      <SelectItem value="Senior-level">Senior-level (5+ years)</SelectItem>
                      <SelectItem value="Any">Any Experience Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </section>

              {/* Posting Date */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-teal-500" />
                  Posting Date
                </h3>
                <div>
                  <Label htmlFor="postedDate" className="font-medium">
                    Posting Date
                  </Label>
                  <Input
                    id="postedDate"
                    name="postedDate"
                    type="date"
                    value={formData.postedDate}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">Job will be visible from this date. Default is today.</p>
                </div>
              </section>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-base font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting Job..." : "Post Job"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}
