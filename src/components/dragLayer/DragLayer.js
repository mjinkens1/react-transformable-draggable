import React, { memo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDragLayer } from 'react-dnd'
import throttle from 'lodash.throttle'

// Utils
import { utils } from '../../utils'

// Styles
import './styles.scss'

const getItemStyles = throttle((offsetDiff, item, providerRef, initialPageScroll) => {
    if (!offsetDiff || !providerRef || !initialPageScroll) {
        const transform = `translate(${x + left}px, ${y + top}px)`

        return { transform }
    }

    const { scrollX: initialScrollX, scrollY: initialScrollY } = initialPageScroll
    const { scrollX, scrollY } = window

    const deltaScrollX = scrollX - initialScrollX
    const deltaScrollY = scrollY - initialScrollY

    const { top, left } = providerRef.current.getBoundingClientRect()
    const { x, y } = offsetDiff

    // Transform relative to previder container, accounting for any scroll changes during drag
    const transform = `translate3d(${x + left + deltaScrollX}px, ${y + top + deltaScrollY}px, 0)`

    return { transform }
}, 10)

export const DragLayer = memo(({ children, id, initialPageScroll, providerRef }) => {
    const [currentOffsetDiff, setCurrentOffsetDiff] = useState({ x: 0, y: 0 })
    const [dragItem, setDragItem] = useState({
        initialDimensions: {},
        resizeDimensions: {},
        wrapperParams: {},
    })

    const { isDragging, item, itemType, offsetDiff } = useDragLayer(monitor => ({
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        offsetDiff: monitor.getDifferenceFromInitialOffset(),
    }))

    useEffect(() => {
        if (isDragging) {
            setDragItem(item)
        }
    }, [item, isDragging])

    if (!dragItem || !isDragging || itemType === 'DROPPABLE_WRAPPER') {
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
            style={getItemStyles(offsetDiff, item, providerRef, initialPageScroll)}
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
