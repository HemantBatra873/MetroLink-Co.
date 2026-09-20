import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  Marker,
  MarkerContent,
  MarkerIcon,
} from '@enterprise/component-library'
import { Circle } from 'lucide-react'

export interface TimelineEntry {
  id: string
  title: string
  subtitle?: string
  timestamp: string
}

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No events recorded yet.</p>
  }

  return (
    <ItemGroup className="gap-0">
      {entries.map((entry, index) => (
        <Item key={entry.id} variant="default" size="sm" className="items-start gap-3 py-3">
          <ItemMedia variant="icon" className="mt-0.5">
            <Marker variant="default" className="h-8 w-8 rounded-full border border-border bg-muted/40">
              <MarkerIcon>
                <Circle
                  className={`h-2 w-2 ${index === 0 ? 'fill-primary text-primary' : 'fill-muted-foreground text-muted-foreground'}`}
                />
              </MarkerIcon>
              <MarkerContent className="sr-only">{entry.title}</MarkerContent>
            </Marker>
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="text-sm">{entry.title}</ItemTitle>
            {entry.subtitle && <ItemDescription>{entry.subtitle}</ItemDescription>}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(entry.timestamp).toLocaleString()}
            </p>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}
