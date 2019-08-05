import React, { memo, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDragLayer } from 'react-dnd'
import throttle from 'lodash.throttle'

// Utils
import { utils } from '../../utils'

// Styles
import './styles.scss'

const getItemStyles = throttle((offsetDiff, item, providerRef, initialPageScroll) => {
    if (!offsetDiff || !providerRef) {
        const transform = `translate(${x + left}px, ${y + top}px)`

        return { transform, display: 'none' }
    }

    const { scrollX: initialScrollX, scrollY: initialScrollY } = initialPageScroll
    const { scrollX, scrollY } = window

    const deltaScrollX = scrollX - initialScrollX
    const deltaScrollY = scrollY - initialScrollY

    const { top, left } = providerRef.current.getBoundingClientRect()
    const { x, y } = offsetDiff

    // Transform relative to previder container, accounting for any scroll changes during drag
    const transform = `translate(${x + left + deltaScrollX}px, ${y + top + deltaScrollY}px)`

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
            document.querySelector('body').style.overflowX = 'hidden'
        } else {
            document.querySelector('body').style.overflowX = 'auto'
        }

        if (offsetDiff) {
            // This puts style updates one render behind the offset update and prevents flashing when stopping drag
            setCurrentOffsetDiff(offsetDiff)
        }
    }, [item, offsetDiff, isDragging])

    if ((!isDragging, !dragItem || itemType === 'DROPPABLE_WRAPPER')) {
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
            style={getItemStyles(currentOffsetDiff, item, providerRef, initialPageScroll)}
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
