import { MoveRight } from "lucide-react"

/**
 * ThinArrow – wraps lucide's MoveRight icon for a clean
 * long-shaft + compact-head arrow that matches the reference style.
 */
export const ThinArrow: React.FC<{
  size?: number
  className?: string
}> = ({ size = 20, className = "" }) => (
  <MoveRight size={size} strokeWidth={1.25} className={className} />
)
