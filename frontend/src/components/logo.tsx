import { FileText } from "lucide-react"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`text-primary ${className}`}>
      <FileText className="h-full w-full" />
    </div>
  )
}
