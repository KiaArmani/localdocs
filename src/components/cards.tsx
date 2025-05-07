import Link from 'next/link'
import React from 'react'
import { BookOpen, PanelsTopLeft, Shapes, type LucideProps } from 'lucide-react'

// Icon map
const iconMap: { [key: string]: React.ComponentType<LucideProps> } = {
  BookOpen,
  PanelsTopLeft,
  Shapes,
  // Add other icons here if needed
}

type Content = {
  title: string
  description: string
  url: string
  icon: string
}

const Cards = ({ content }: { content?: Content[] }) => (
  <ul
    className="mb-[var(--p-content-gap-clusters)] mt-[var(--p-content-gap)] grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0"
  >
    {content?.map((card) => (
      <li key={card.url}>
        <Card
          title={card.title}
          description={card.description}
          icon={card.icon}
          url={card.url}
        />
      </li>
    ))}
  </ul>
)

const Card = ({ title, description, url, icon: iconName }: Content) => {
  const IconComponent = iconMap[iconName]
  return (
    <Link
      className="border-color-base bg-color-low hover:border-color-accent-low hover:bg-color-low/95 block h-full overflow-hidden rounded border transition duration-100 active:translate-y-[1px]"
      href={url}
    >
      <div className="flex flex-col sm:flex-row gap-3 p-4 h-full">
        {IconComponent && (
          <IconComponent
            className="text-color-low mt-0.5 shrink-0"
            size={20}
            strokeWidth={1.5}
          />
        )}
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-sm font-medium">{title}</span>
          {description && <span className="text-color-low text-sm">{description}</span>}
        </div>
      </div>
    </Link>
  )
}

export default Cards
