import { Alert, AlertDescription, AlertTitle } from '@enterprise/component-library'
import { AlertCircle } from 'lucide-react'

export function ApiAlert({ message }: { message?: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>API unavailable</AlertTitle>
      <AlertDescription>
        {message ??
          'Start the backend services (Identity 5265, Enforcement 5208, Payment 5210, Parking 5212) or configure VITE_*_API_URL in .env.'}
      </AlertDescription>
    </Alert>
  )
}
