import React from 'react'
import { useDragLayer } from 'react-dnd'

const getItemStyles = offsetDiff => {
    if (!offsetDiff) {
        return {
            display: 'none',
        }
    }

    const { x, y } = offsetDiff
    const transform = `translate(${x}px, ${y}px)`

    return { transform }
}

export const DragLayer = ({ children, currentId, id }) => {
    const { item, isDragging, offsetDiff } = useDragLayer(monitor => ({
        offsetDiff: monitor.getDifferenceFromInitialOffset(),
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
    }))

    if (!isDragging || id !== currentId) {
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
    } = item
    const { width: initialWidth, height: initialHeight } = initialDimensions
    const { width, height, ...resizeBounds } = resizeDimensions

    const scaleX = width / initialWidth
    const scaleY = height / initialHeight

    const childTransform = lockAspectRatio
        ? `scale(${Math.min(height / minHeight, width / minWidth)})`
        : `scale(${scaleX}, ${scaleY})`

    return (
        <div style={getItemStyles(offsetDiff, item)}>
            {React.Children.map(children, child => {
                return React.cloneElement(child, {
                    dragLayerParams: { ...wrapperParams, transform: `rotateZ(${rotation}deg)` },
                    dragLayerBounds: resizeBounds,
                    dragLayerChildTransform: childTransform,
                })
            })}
        </div>
    )
}
