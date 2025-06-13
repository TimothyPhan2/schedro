import { Suspense } from 'react'
import { InvalidLinkContent } from '@/app/components/shared/InvalidLinkContent'

export default function InvalidLinkPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={<div>Loading...</div>}>
          <InvalidLinkContent />
        </Suspense>
      </div>
    </div>
  )
} 