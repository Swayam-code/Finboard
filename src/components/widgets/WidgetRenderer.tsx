import React from 'react'
import { Widget } from '@/types'
import { CardWidget } from './CardWidget'
import { TableWidget } from './TableWidget'
import { ChartWidget } from './ChartWidget'

interface WidgetRendererProps {
  widget: Widget
}

export function WidgetRenderer({ widget }: WidgetRendererProps) {
  switch (widget.type) {
    case 'card':
      return <CardWidget widget={widget} />
    case 'table':
      return <TableWidget widget={widget} />
    case 'chart':
      return <ChartWidget widget={widget} />
    default:
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-full flex items-center justify-center">
          <p className="text-gray-400">Unknown widget type: {widget.type}</p>
        </div>
      )
  }
}
