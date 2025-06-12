"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown } from "lucide-react"

export default function ModernHeader() {
  const { isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name)
  }

  return (
    <header className="backdrop-blur-md bg-white/70 border-b border-white/20 sticky top-0 z-50 shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm sm:text-lg">K</span>
            </div>
            <span className="font-bold text-lg sm:text-xl text-gray-900 hidden xs:block">KaamSathi</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Find talent dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("talent")}
                className="px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white/80 flex items-center transition-colors"
              >
                Find talent
                <ChevronDown className="ml-1 h-3 w-3 lg:h-4 lg:w-4" />
              </button>
              {activeDropdown === "talent" && (
                <div className="absolute left-0 mt-2 w-44 lg:w-48 rounded-md shadow-lg bg-white/90 backdrop-blur-md ring-1 ring-black/5">
                  <div className="py-1">
                    <Link
                      href="/search/workers"
                      className="block px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-700 hover:bg-blue-50/80 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Search Workers
                    </Link>
                    <Link
                      href="/search/workers?category=construction"
                      className="block px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-700 hover:bg-blue-50/80 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Construction Workers
                    </Link>
                    <Link
                      href="/search/workers?category=plumbing"
                      className="block px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-700 hover:bg-blue-50/80 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Plumbers
                    </Link>
                    <Link
                      href="/search/workers?category=electrical"
                      className="block px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-700 hover:bg-blue-50/80 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Electricians
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Find work dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("work")}
                className="px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white/80 flex items-center transition-colors"
              >
                Find work
                <ChevronDown className="ml-1 h-3 w-3 lg:h-4 lg:w-4" />
              </button>
              {activeDropdown === "work" && (
                <div className="absolute left-0 mt-2 w-44 lg:w-48 rounded-md shadow-lg bg-white/90 backdrop-blur-md ring-1 ring-black/5">
                  <div className="py-1">
                    <Link
                      href="/search/jobs"
                      className="block px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-700 hover:bg-blue-50/80 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Search Jobs
                    </Link>
                    <Link
                      href="/search/jobs?category=construction"
                      className="block px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-700 hover:bg-blue-50/80 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Construction Jobs
                    </Link>
                    <Link
                      href="/search/jobs?category=plumbing"
                      className="block px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-700 hover:bg-blue-50/80 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Plumbing Jobs
                    </Link>
                    <Link
                      href="/search/jobs?category=electrical"
                      className="block px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-700 hover:bg-blue-50/80 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Electrical Jobs
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Why KaamSathi dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown("why")}
                className="px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white/80 flex items-center transition-colors"
              >
                <span className="hidden lg:inline">Why KaamSathi</span>
                <span className="lg:hidden">Why</span>
                <ChevronDown className="ml-1 h-3 w-3 lg:h-4 lg:w-4" />
              </button>
              {activeDropdown === "why" && (
                <div className="absolute left-0 mt-2 w-44 lg:w-48 rounded-md shadow-lg bg-white/90 backdrop-blur-md ring-1 ring-black/5">
                  <div className="py-1">
                    <Link
                      href="/about"
                      className="block px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-700 hover:bg-blue-50/80 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      About Us
                    </Link>
                    <Link
                      href="/how-it-works"
                      className="block px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-700 hover:bg-blue-50/80 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      How It Works
                    </Link>
                    <Link
                      href="/success-stories"
                      className="block px-3 lg:px-4 py-2 text-xs lg:text-sm text-gray-700 hover:bg-blue-50/80 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Success Stories
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/enterprise"
              className="px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white/80 transition-colors"
            >
              Enterprise
            </Link>
            <Link
              href="/pricing"
              className="px-2 lg:px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white/80 transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-gray-700 hover:bg-white/80 transition-colors text-xs lg:text-sm px-2 lg:px-3"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600/90 hover:bg-blue-700 text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg text-xs lg:text-sm px-3 lg:px-4">
                Sign up
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-white/80 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md border-t border-white/20">
          <div className="px-2 pt-2 pb-3 space-y-1 max-h-96 overflow-y-auto">
            <div>
              <button
                onClick={() => toggleDropdown("mobile-talent")}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white/80 flex items-center justify-between transition-colors"
              >
                Find talent
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === "mobile-talent" && (
                <div className="pl-4 space-y-1">
                  <Link
                    href="/search/workers"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50/80 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Search Workers
                  </Link>
                  <Link
                    href="/search/workers?category=construction"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50/80 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Construction Workers
                  </Link>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggleDropdown("mobile-work")}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white/80 flex items-center justify-between transition-colors"
              >
                Find work
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === "mobile-work" && (
                <div className="pl-4 space-y-1">
                  <Link
                    href="/search/jobs"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50/80 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Search Jobs
                  </Link>
                  <Link
                    href="/search/jobs?category=construction"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50/80 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Construction Jobs
                  </Link>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => toggleDropdown("mobile-why")}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-white/80 flex items-center justify-between transition-colors"
              >
                Why KaamSathi
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {activeDropdown === "mobile-why" && (
                <div className="pl-4 space-y-1">
                  <Link
                    href="/about"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50/80 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link
                    href="/how-it-works"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50/80 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    How It Works
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/enterprise"
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50/80 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Enterprise
            </Link>
            <Link
              href="/pricing"
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50/80 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>

            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-3">
                <Link
                  href="/login"
                  className="block w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50/80 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
              </div>
              <div className="mt-3 px-3">
                <Link
                  href="/signup"
                  className="block w-full px-3 py-2 rounded-md text-sm font-medium bg-blue-600/90 text-white hover:bg-blue-700 text-center shadow-md transition-all duration-300 hover:shadow-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
