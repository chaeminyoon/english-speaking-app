import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export default function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps) {
  const hoverStyles = hoverable
    ? 'cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all'
    : ''

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
