import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'destructive' | 'outline'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

    const variants = {
      default: "bg-gray-900 text-white",
      primary: "bg-blue-600 text-white",
      secondary: "bg-gray-200 text-gray-900",
      success: "bg-green-600 text-white",
      warning: "bg-yellow-600 text-white",
      danger: "bg-red-600 text-white",
      destructive: "bg-red-600 text-white",
      outline: "border border-gray-300 bg-transparent text-gray-900",
    }

    return (
      <div
        className={cn(baseStyles, variants[variant], className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Badge.displayName = "Badge"

export { Badge }
