import React from 'react'
import { DndProvider, useDrop } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import TouchBackend from 'react-dnd-touch-backend'
import './styles.scss'

const backend = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
)
    ? TouchBackend
    : HTML5Backend

const DropTargetLayout = React.forwardRef(({ children, setDragUpdate }, ref) => {
    const [, drop] = useDrop({
        accept: ['TRANSFORMABLE_DRAGGABLE'],
        drop: ({ id }, monitor) => {
            const update = { ...monitor.getDifferenceFromInitialOffset(), id }

            setDragUpdate(update)
        },
    })

    return (
        <div ref={drop}>
            <div ref={ref} className="drop-target">
                {children}
            </div>
        </div>
    )
})

export const DropTarget = React.forwardRef(({ children, setDragUpdate }, ref) => {
    return (
        <DndProvider backend={backend}>
            <DropTargetLayout ref={ref} setDragUpdate={setDragUpdate}>
                {children}
            </DropTargetLayout>
        </DndProvider>
    )
})
