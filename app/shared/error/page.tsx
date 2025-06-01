import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SharedErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something Went Wrong
          </h2>
          <p className="text-gray-600">
            We encountered an error while trying to access this shared calendar.
          </p>
        </div>

        <Alert>
          <AlertDescription>
            Please try again in a few moments, or contact the calendar owner if the problem persists.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
} 