import React from 'react'
import { DndProvider, useDrop } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import TouchBackend from 'react-dnd-touch-backend'
import { DragLayer } from '../dragLayer/DragLayer'
import './styles.scss'

const backend = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
)
    ? TouchBackend
    : HTML5Backend

const DropTargetLayout = React.forwardRef(({ children, consumerRef, setDragUpdate }, ref) => {
    const [{ id }, drop] = useDrop({
        accept: ['TRANSFORMABLE_DRAGGABLE'],
        collect: monitor => ({ ...monitor.getItem() }),
        drop: ({ id }, monitor) => {
            const update = { ...monitor.getDifferenceFromInitialOffset(), id }

            setDragUpdate(update)
        },
    })

    return (
        <div ref={drop}>
            <div ref={ref} className="drop-target">
                {React.Children.map(children, child => (
                    <DragLayer id={id} currentId={child.props.id}>
                        {child}
                    </DragLayer>
                ))}
                {children}
            </div>
        </div>
    )
})

export const DropTarget = React.forwardRef(({ children, consumerRef, setDragUpdate }, ref) => {
    return (
        <DndProvider backend={backend}>
            <DropTargetLayout ref={ref} setDragUpdate={setDragUpdate}>
                {children}
            </DropTargetLayout>
        </DndProvider>
    )
})
