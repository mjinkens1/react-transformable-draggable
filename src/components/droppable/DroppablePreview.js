import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useDragLayer } from 'react-dnd'

import './styles.scss'

const getItemStyles = (differenceFromInitialOffset, containerRef) => {
    const previewNode = document.getElementById(
        'react-transformable-draggable-droppable-preview-node'
    )

    if (!differenceFromInitialOffset) {
        return { display: 'none' }
    }

    const { top, left } = previewNode.getBoundingClientRect()
    const { top: previewTop, left: previewLeft } = containerRef.current.getBoundingClientRect()

    const offsetX = previewLeft - left
    const offsetY = previewTop - top

    const { x, y } = differenceFromInitialOffset
    const transform = `translate(${x + offsetX}px, ${y + offsetY}px)`

    return { transform }
}

export const DroppablePreview = ({ children, containerRef }) => {
    const { differenceFromInitialOffset, isDragging, itemType } = useDragLayer(monitor => ({
        differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
    }))

    if (!isDragging || itemType === 'TRANSFORMABLE_DRAGGABLE') {
        return null
    }

    return createPortal(
        <div
            id="react-transformable-draggable-droppable-preview-container"
            className="droppable-preview-container"
            style={getItemStyles(differenceFromInitialOffset, containerRef)}
        >
            {children}
        </div>,
        document.getElementById('react-transformable-draggable-droppable-preview-node')
    )
}
