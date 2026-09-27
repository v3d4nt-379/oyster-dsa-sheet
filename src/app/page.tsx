"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/firebase/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AuthPage() {
  const { user, loading, signInWithGoogle, error } = useAuth()
  const router = useRouter()
  const [isSigningIn, setIsSigningIn] = React.useState(false)

  React.useEffect(() => {
    if (!loading && user) {
      router.push("/sheet")
    }
  }, [user, loading, router])

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
      // Note: redirection is handled by the useEffect above
    } catch (e) {
      setIsSigningIn(false)
    }
  }

  // Prevent flashing the auth page if we're still checking session or redirecting
  if (loading || user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:gap-24">
      {/* LEFT SECTION: Branding & Trust */}
      <div className="flex flex-1 flex-col justify-center space-y-6 text-center lg:text-left">
        <div className="flex flex-col items-center gap-4 lg:items-start">
          {/* Official Club Logo */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <img src="/logo-light.jpg" alt="DSA Sheet Logo" className="h-full w-full object-contain dark:hidden" />
            <img src="/logo-dark.jpg" alt="DSA Sheet Logo" className="hidden h-full w-full object-contain dark:block" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            DSA Sheet
          </h1>
        </div>
        <p className="text-xl text-muted-foreground">
          An organized, distraction-free DSA practice platform created by our coding club.
        </p>
        <ul className="space-y-3 text-lg font-medium text-foreground">
          <li className="flex items-center gap-3 justify-center lg:justify-start">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">✓</span>
            Structured DSA Roadmap
          </li>
          <li className="flex items-center gap-3 justify-center lg:justify-start">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">✓</span>
            Daily Practice Tracking
          </li>
          <li className="flex items-center gap-3 justify-center lg:justify-start">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">✓</span>
            Curated by the Coding Club
          </li>
        </ul>
      </div>

      {/* RIGHT SECTION: Auth Card */}
      <div className="flex w-full max-w-md flex-col justify-center">
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription className="text-base">
              Build consistency. Master DSA.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pb-8">
            <Button 
              variant="brand" 
              size="lg" 
              className="w-full text-base font-semibold"
              onClick={handleSignIn}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing you in...
                </>
              ) : (
                <>
                  {/* Google SVG Icon */}
                  <svg className="mr-2 h-5 w-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
            {error && (
              <div className="text-sm text-destructive font-medium text-center">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
