import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { type PropsWithChildren } from 'react';

export function SortableList({
  children,
  onSortEnd,
}: PropsWithChildren<{
  onSortEnd: ({ from, to }: { from: number; to: number }) => void;
}>) {
  return (
    <DragDropContext
      onDragEnd={result => {
        onSortEnd({ from: result.source.index, to: result.destination.index });
      }}
    >
      <Droppable droppableId="droppable">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
