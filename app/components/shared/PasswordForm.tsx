'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react'

export function PasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setError('No token provided')
      return
    }

    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    console.log('🔐 PasswordForm: Starting verification', { 
      token: token.substring(0, 30) + '...', 
      tokenLength: token.length,
      hasPassword: !!password 
    })

    setIsLoading(true)
    setError('')

    try {
      // Verify password with API
      console.log('🔐 PasswordForm: Making API call to /api/verify-shared-password')
      const response = await fetch('/api/verify-shared-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      console.log('🔐 PasswordForm: API response status:', response.status)
      const data = await response.json()
      console.log('🔐 PasswordForm: API response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify password')
      }

      if (data.valid) {
        // Password is correct, redirect to calendar with password in URL
        const targetUrl = `/shared/calendar/${token}?password=${encodeURIComponent(password)}`
        console.log('🔐 PasswordForm: Redirecting to:', targetUrl.substring(0, 80) + '...')
        router.push(targetUrl)
      } else {
        setError('Incorrect password. Please try again.')
      }
    } catch (error) {
      console.error('💥 PasswordForm: Password verification error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          No token provided. Please check your link and try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            disabled={isLoading}
            className="pr-10"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading || !password.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          'Access Calendar'
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have the password? Contact the calendar owner.
        </p>
      </div>
    </form>
  )
} 