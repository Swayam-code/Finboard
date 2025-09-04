import React from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { useDashboardStore } from '@/stores/dashboardStore'
import { IntegratedWidget } from '@/components/IntegratedWidget'
import { Widget } from '@/types'

interface DraggableWidgetGridProps {
  widgets: Widget[]
  onAddWidget: () => void
}

export function DraggableWidgetGrid({ widgets, onAddWidget }: DraggableWidgetGridProps) {
  const { reorderWidgets, removeWidget } = useDashboardStore()

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(widgets)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    reorderWidgets(items)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="widgets-grid" direction="horizontal">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 transition-colors ${
              snapshot.isDraggingOver ? 'bg-gray-800/50' : ''
            }`}
          >
            {widgets.map((widget, index) => (
              <Draggable key={widget.id} draggableId={widget.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`h-96 transition-transform ${
                      snapshot.isDragging ? 'rotate-2 scale-105 z-50' : ''
                    }`}
                  >
                    <IntegratedWidget
                      widget={widget}
                      onRemove={() => removeWidget(widget.id)}
                      dragHandleProps={provided.dragHandleProps}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            
            {/* Add Widget Card */}
            <div 
              onClick={onAddWidget}
              className="h-96 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-gray-800/50 transition-colors group"
            >
              <div className="p-4 bg-gray-800 rounded-full group-hover:bg-emerald-600 transition-colors mb-4">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors mb-2">
                Add Widget
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-48">
                Connect to a finance API and create a custom widget
              </p>
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
