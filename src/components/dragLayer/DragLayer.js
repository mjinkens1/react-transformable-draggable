import React, { memo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDragLayer } from 'react-dnd'
import { utils } from '../../utils'
import './styles.scss'

const getItemStyles = (offsetDiff, setLastOffset, providerRef) => {
    if (!offsetDiff || !providerRef) {
        const transform = `translate(${0}px, ${0}px)`

        return { transform, opacity: 0 }
    }

    const { top, left } = providerRef.current.getBoundingClientRect()

    const { x, y } = offsetDiff
    const transform = `translate(${x + left}px, ${y + top}px)`

    return { transform }
}

export const DragLayer = memo(({ children, id, providerRef }) => {
    const [dragItem, setDragItem] = useState({
        initialDimensions: {},
        resizeDimensions: {},
        wrapperParams: {},
    })

    const [currentOffsetDiff, setCurrentOffsetDiff] = useState({ x: 0, y: 0 })

    const { isDragging, item, itemType, offsetDiff } = useDragLayer(monitor => ({
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        offsetDiff: monitor.getDifferenceFromInitialOffset(),
    }))

    useEffect(() => {
        if (item) {
            setDragItem(item)
            document.querySelector('body').style.overflowX = 'hidden'
        } else {
            document.querySelector('body').style.overflowX = 'auto'
        }

        if (offsetDiff) {
            setCurrentOffsetDiff(offsetDiff)
        }
    }, [item, offsetDiff])

    if (!dragItem || itemType === 'DROPPABLE_WRAPPER') {
        return null
    }

    const {
        initialDimensions,
        lockAspectRatio,
        minHeight,
        minWidth,
        resizeDimensions,
        rotation,
        wrapperParams,
    } = dragItem

    const { width: initialWidth, height: initialHeight } = initialDimensions
    const { width, height, ...resizeBounds } = resizeDimensions

    const scaleX = width / initialWidth
    const scaleY = height / initialHeight

    const childTransform = lockAspectRatio
        ? `scale(${Math.max(width / initialWidth, height / initialHeight)})`
        : `scale(${scaleX}, ${scaleY})`

    return createPortal(
        <div
            className="drag-layer-container"
            style={getItemStyles(currentOffsetDiff, item, providerRef)}
        >
            {React.Children.map(children, child => {
                return React.cloneElement(child, {
                    dragLayerParams: { ...wrapperParams, transform: `rotateZ(${rotation}deg)` },
                    dragLayerBounds: resizeBounds,
                    dragLayerChildTransform: childTransform,
                    isDragLayer: true,
                    dragLayerIsDragging: isDragging,
                })
            })}
        </div>,
        document.getElementById('react-transformable-draggable-drag-layer-node')
    )
}, utils.isEqual)
