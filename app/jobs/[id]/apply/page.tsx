"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import SidebarLayout from "@/components/sidebar-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, CheckCircle } from "lucide-react"
import { mockJobs } from "@/data/mock-data"
import Link from "next/link"
import { toast } from "@/hooks/use-toast" // Ensure toast is imported

export default function JobApplicationPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = Number(params.id)

  const [job, setJob] = useState(mockJobs.find((j) => j.id === jobId))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    expectedSalary: "",
    availability: "",
    experience: "",
    skills: [] as string[],
    hasTransportation: false,
    canWorkWeekends: false,
    resume: null as File | null,
  })
  const [formErrors, setFormErrors] = useState({
    coverLetter: "",
    // Add other fields if specific validation beyond 'required' is needed
  })

  const validateApplicationForm = () => {
    const errors = { coverLetter: "" }
    let isValid = true
    if (!applicationData.coverLetter.trim()) {
      errors.coverLetter = "Cover letter is required."
      isValid = false
    }
    // Add more validation rules if needed
    setFormErrors(errors)
    return isValid
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!user || !job || user.role !== "worker") {
    return null
  }

  const handleSkillToggle = (skill: string) => {
    setApplicationData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setApplicationData((prev) => ({ ...prev, resume: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateApplicationForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Save application to localStorage (mock database)
    const applications = JSON.parse(localStorage.getItem("user_applications") || "[]")
    const newApplication = {
      id: Date.now(),
      jobId: jobId,
      userId: user.id,
      jobTitle: job.title,
      company: job.company,
      appliedDate: new Date().toISOString(),
      status: "submitted",
      ...applicationData,
      resume: applicationData.resume?.name || null,
    }

    applications.push(newApplication)
    localStorage.setItem("user_applications", JSON.stringify(applications))

    // Also save to employer's applications list
    const employerApplications = JSON.parse(localStorage.getItem("employer_applications") || "[]")
    const employerApplication = {
      ...newApplication,
      applicantName: user.name,
      applicantPhone: user.phone,
      applicantEmail: user.email,
    }
    employerApplications.push(employerApplication)
    localStorage.setItem("employer_applications", JSON.stringify(employerApplications))

    setIsSubmitting(false)
    router.push(`/jobs/${jobId}/apply/success`)
  }

  return (
    <SidebarLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/jobs/${jobId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Job
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Apply for {job.title}</h1>
            <p className="text-gray-600">
              {job.company} • {job.location}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={user.name} disabled className="bg-gray-50" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input value={user.phone} disabled className="bg-gray-50" />
                </div>
              </div>
              {user.email && (
                <div>
                  <Label>Email Address</Label>
                  <Input value={user.email} disabled className="bg-gray-50" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="coverLetter">Cover Letter *</Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Tell us why you're interested in this position and what makes you a good fit..."
                  rows={4}
                  value={applicationData.coverLetter}
                  onChange={(e) => {
                    setApplicationData((prev) => ({ ...prev, coverLetter: e.target.value }))
                    if (formErrors.coverLetter && e.target.value.trim()) {
                      setFormErrors((prev) => ({ ...prev, coverLetter: "" }))
                    }
                  }}
                  required
                  className={formErrors.coverLetter ? "border-red-500" : ""}
                  aria-describedby={formErrors.coverLetter ? "coverLetter-error" : undefined}
                />
                {formErrors.coverLetter && (
                  <p id="coverLetter-error" className="text-red-500 text-xs mt-1">
                    {formErrors.coverLetter}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedSalary">Expected Salary</Label>
                  <Input
                    id="expectedSalary"
                    placeholder="e.g., ₹15,000/month or ₹500/day"
                    value={applicationData.expectedSalary}
                    onChange={(e) => setApplicationData((prev) => ({ ...prev, expectedSalary: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={applicationData.availability}
                    onValueChange={(value) => setApplicationData((prev) => ({ ...prev, availability: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="1-week">Within 1 week</SelectItem>
                      <SelectItem value="2-weeks">Within 2 weeks</SelectItem>
                      <SelectItem value="1-month">Within 1 month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Relevant Experience</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe your relevant work experience..."
                  rows={3}
                  value={applicationData.experience}
                  onChange={(e) => setApplicationData((prev) => ({ ...prev, experience: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Select the skills that match this job:</p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={applicationData.skills.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <Label htmlFor={`skill-${skill}`} className="text-sm">
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>
                {applicationData.skills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Selected skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {applicationData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transportation"
                  checked={applicationData.hasTransportation}
                  onCheckedChange={(checked) =>
                    setApplicationData((prev) => ({ ...prev, hasTransportation: !!checked }))
                  }
                />
                <Label htmlFor="transportation">I have reliable transportation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weekends"
                  checked={applicationData.canWorkWeekends}
                  onCheckedChange={(checked) => setApplicationData((prev) => ({ ...prev, canWorkWeekends: !!checked }))}
                />
                <Label htmlFor="weekends">I can work weekends if needed</Label>
              </div>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Resume/CV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload your resume or CV</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <Label htmlFor="resume-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm">
                    Choose File
                  </Button>
                </Label>
                {applicationData.resume && (
                  <p className="text-sm text-green-600 mt-2">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    {applicationData.resume.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href={`/jobs/${jobId}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || !applicationData.coverLetter.trim()} // Ensure trim check
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  )
}
