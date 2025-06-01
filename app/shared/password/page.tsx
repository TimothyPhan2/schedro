import { Suspense } from 'react'
import { PasswordForm } from '@/app/components/shared/PasswordForm'

export default function SharedPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Password Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This shared calendar is password protected. Please enter the password to continue.
          </p>
        </div>
        
        <Suspense fallback={<div>Loading...</div>}>
          <PasswordForm />
        </Suspense>
      </div>
    </div>
  )
} 