'use client'

import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { XCircle, Clock, Shield } from 'lucide-react'

export function InvalidLinkContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorContent = () => {
    if (error?.includes('expired')) {
      return {
        icon: <Clock className="h-12 w-12 text-orange-500" />,
        title: 'Link Expired',
        message: 'This shared calendar link has expired and is no longer valid.',
        suggestion: 'Please contact the calendar owner to request a new link.'
      }
    }

    if (error?.includes('password')) {
      return {
        icon: <Shield className="h-12 w-12 text-blue-500" />,
        title: 'Password Required',
        message: 'This shared calendar link requires a password for access.',
        suggestion: 'Please contact the calendar owner for the correct password.'
      }
    }

    if (error?.includes('revoked') || error?.includes('not found')) {
      return {
        icon: <XCircle className="h-12 w-12 text-red-500" />,
        title: 'Link Not Found',
        message: 'This shared calendar link has been revoked or does not exist.',
        suggestion: 'Please contact the calendar owner to verify the link.'
      }
    }

    // Default error
    return {
      icon: <XCircle className="h-12 w-12 text-red-500" />,
      title: 'Invalid Link',
      message: 'This shared calendar link is not valid or has been corrupted.',
      suggestion: 'Please check the link and try again, or contact the calendar owner.'
    }
  }

  const errorContent = getErrorContent()

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        {errorContent.icon}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {errorContent.title}
        </h2>
        <p className="text-gray-600">
          {errorContent.message}
        </p>
      </div>

      <Alert>
        <AlertDescription>
          {errorContent.suggestion}
        </AlertDescription>
      </Alert>

      {error && (
        <details className="text-left">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Technical Details
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-600 font-mono">
            Error: {error}
          </div>
        </details>
      )}
    </div>
  )
} 