import React from 'react'
import { useDragLayer } from 'react-dnd'

import './styles.scss'

const getItemStyles = differenceFromInitialOffset => {
    if (!differenceFromInitialOffset) {
        return { display: 'none' }
    }

    const { x, y } = differenceFromInitialOffset
    const transform = `translate(${x}px, ${y}px)`

    return { transform }
}

export const DroppablePreview = ({ children }) => {
    const { differenceFromInitialOffset, isDragging, itemType } = useDragLayer(monitor => ({
        differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
    }))

    if (!isDragging || itemType === 'TRANSFORMABLE_DRAGGABLE') {
        return null
    }

    return (
        <div
            className="droppable-preview-container"
            style={getItemStyles(differenceFromInitialOffset)}
        >
            {children}
        </div>
    )
}
