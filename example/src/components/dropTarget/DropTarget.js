import React from 'react'
import { useDrop } from 'react-dnd'
import { DragLayer } from '../dragLayer/DragLayer'

import './styles.scss'

export const DropTarget = React.forwardRef(({ children, consumerRef, setDragUpdate }, ref) => {
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
