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
            className={`grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 transition-colors ${
              snapshot.isDraggingOver ? 'bg-gray-800/50' : ''
            }`}
          >
            {widgets.map((widget, index) => (
              <Draggable key={widget.id} draggableId={widget.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`h-80 sm:h-96 transition-transform touch-manipulation ${
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
            
            {/* Add Widget Card - Mobile Responsive */}
            <div 
              onClick={onAddWidget}
              className="h-80 sm:h-96 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-gray-800/50 active:bg-gray-800/70 transition-colors group touch-manipulation"
            >
              <div className="p-3 sm:p-4 bg-gray-800 rounded-full group-hover:bg-emerald-600 group-active:bg-emerald-700 transition-colors mb-3 sm:mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-300 group-hover:text-white transition-colors mb-2">
                Add Widget
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 text-center max-w-44 sm:max-w-48 px-2">
                <span className="hidden sm:inline">Connect to a finance API and create a custom widget</span>
                <span className="sm:hidden">Tap to add a new widget</span>
              </p>
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
