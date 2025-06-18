import { RegisterForm } from "@/components/auth/register-form";
import { Logo } from "@/components/logo";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <Logo size="lg" />
          <h1 className="text-2xl font-bold">Lawverra</h1>
          <p className="text-sm text-muted-foreground">
            Legal document automation platform
          </p>
        </div>
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
