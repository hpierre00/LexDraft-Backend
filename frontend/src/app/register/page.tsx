import { RegisterForm } from "@/components/auth/register-form"
import { Logo } from "@/components/logo"

export default function RegisterPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center min-h-screen w-screen bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <Logo className="h-12 w-12" />
          <h1 className="text-2xl font-bold">LexDraft</h1>
          <p className="text-sm text-muted-foreground">Legal document automation platform</p>
        </div>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
