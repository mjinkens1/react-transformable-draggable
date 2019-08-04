import React, { memo, useEffect, useState } from 'react'
import { useDragLayer } from 'react-dnd'
import { utils } from '../../utils'
import './styles.scss'

const getItemStyles = (offsetDiff, setLastOffset) => {
    if (!offsetDiff) {
        const transform = `translate(${0}px, ${0}px)`

        return { transform, opacity: 0 }
    }

    const { x, y } = offsetDiff
    const transform = `translate(${x}px, ${y}px)`

    return { transform }
}

export const DragLayer = memo(({ children, id }) => {
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
        ? `scale(${Math.min(height / minHeight, width / minWidth)})`
        : `scale(${scaleX}, ${scaleY})`

    return (
        <div className="drag-layer-container" style={getItemStyles(currentOffsetDiff, item)}>
            {React.Children.map(children, child => {
                return React.cloneElement(child, {
                    dragLayerParams: { ...wrapperParams, transform: `rotateZ(${rotation}deg)` },
                    dragLayerBounds: resizeBounds,
                    dragLayerChildTransform: childTransform,
                    isDragLayer: true,
                    dragLayerIsDragging: isDragging,
                })
            })}
        </div>
    )
}, utils.isEqual)
