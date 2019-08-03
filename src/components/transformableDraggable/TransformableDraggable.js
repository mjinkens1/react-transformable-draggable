import React, { useEffect, useRef, useState } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

// Components
import { ResizeHandle } from './ResizeHandle'
import { RotateHandle } from './RotateHandle'

// Styles
import './styles.scss'

// Utils
import { utils } from '../../utils'

const INITIAL_DIMENSIONS = { width: 200, height: 200, top: 0, left: 0 }
const INITIAL_ASPECT_RATIO = 1

const cursorPositions = [
    'top-left',
    'top-center',
    'top-right',
    'right',
    'bottom-right',
    'bottom-center',
    'bottom-left',
    'left',
]

const cursorPositionsAspectLocked = ['top-left', 'top-right', 'bottom-right', 'bottom-left']

export const TransformableDraggable = ({
    children,
    dragUpdate,
    dragLayerBounds,
    dragLayerChildTransform,
    dragLayerParams,
    id,
    initialPosition,
    lockAspectRatio,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    providerRef,
    resizeHandleStyle,
    resizeHandleStyleMobile,
    rotateHandleStyle,
    rotateHandleStyleMobile,
    setDragUpdate,
}) => {
    const [aspectRatio, setAspectRatio] = useState(INITIAL_ASPECT_RATIO)
    const [initialDimensions, setInitialDimensions] = useState(INITIAL_DIMENSIONS)
    const [isResizing, setIsResizing] = useState(false)
    const [isRotating, setIsRotating] = useState(false)
    const [resizeDimensions, setResizeDimensions] = useState(INITIAL_DIMENSIONS)
    const [rotation, setRotation] = useState(0)
    const [wrapperParams, setWrapperParams] = useState({
        ...INITIAL_DIMENSIONS,
        ...initialPosition,
    })
    const [initialized, setInitialized] = useState(false)

    const containerRef = useRef()
    const childRef = useRef()

    const { width: initialWidth, height: initialHeight } = initialDimensions
    const { width, height, ...resizeBounds } = resizeDimensions

    const scaleX = width / initialWidth
    const scaleY = height / initialHeight
    const rotateTransform = `rotateZ(${rotation}deg)`
    const cursors = lockAspectRatio ? cursorPositionsAspectLocked : cursorPositions

    const minMax = {
        minWidth,
        minHeight: lockAspectRatio ? minWidth / aspectRatio : minHeight,
        maxWidth,
        maxHeight,
    }
    const minSize = { minWidth, minHeight }

    const childTransform = lockAspectRatio
        ? `scale(${Math.min(height / minHeight, width / minWidth)})`
        : `scale(${scaleX}, ${scaleY})`

    const [{ isDragging }, drag, preview] = useDrag({
        item: {
            id,
            type: 'TRANSFORMABLE_DRAGGABLE',
            wrapperParams,
            resizeDimensions,
            initialDimensions,
            rotation,
            lockAspectRatio,
            ...minMax,
        },
        canDrag: !isResizing && !isRotating,
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    })

    useEffect(() => {
        preview(getEmptyImage())
    }, [preview])

    useEffect(() => {
        React.Children.only(children)

        const childDimensions = {
            width: Math.max(childRef.current.clientWidth, minWidth),
            height: Math.max(childRef.current.clientHeight, minHeight),
        }

        const { top, left } = containerRef.current.getBoundingClientRect()
        const { top: providerTop, left: providerLeft } = providerRef.current.getBoundingClientRect()

        const childAspectRatio = childDimensions.width / childDimensions.height

        if (!initialized) {
            setAspectRatio(childAspectRatio)
            setInitialDimensions(childDimensions)
            setResizeDimensions({ ...childDimensions, top: 0, right: 0, bottom: 0, left: 0 })
            setWrapperParams({
                ...childDimensions,
                top: top - providerTop,
                left: left - providerLeft,
            })

            setInitialized(true)
        }
    }, [children, dragLayerBounds, dragLayerParams, initialized, minHeight, minWidth, providerRef])

    useEffect(() => {
        if (dragUpdate) {
            const { id: updateId, ...positionUpdate } = dragUpdate

            if (id === updateId) {
                const { top, left, ...wrapperDimensions } = wrapperParams
                const { x, y } = positionUpdate

                setWrapperParams({ ...wrapperDimensions, top: top + y, left: left + x })
                setDragUpdate(null)
            }
        }
    }, [id, dragUpdate, wrapperParams, setDragUpdate])

    return (
        <div
            ref={drag}
            className="resize-container-wrapper"
            style={{
                ...wrapperParams,
                transform: rotateTransform,
                opacity: isDragging ? 0 : 1,
                ...dragLayerParams,
            }}
        >
            <div
                ref={containerRef}
                className="resize-container"
                style={{
                    ...resizeBounds,
                    ...dragLayerBounds,
                    ...minMax,
                }}
            >
                <RotateHandle
                    containerRef={containerRef}
                    containerPosition={wrapperParams}
                    isResizing={isResizing}
                    isRotating={isRotating}
                    providerRef={providerRef}
                    rotation={rotation}
                    setIsRotating={setIsRotating}
                    setRotation={setRotation}
                    style={rotateHandleStyle}
                    styleMobile={rotateHandleStyleMobile}
                />
                {cursors.map(cursorPosition => {
                    const resizeFunction = utils.getResizeFunction(cursorPosition, lockAspectRatio)

                    return (
                        <ResizeHandle
                            key={cursorPosition}
                            containerRef={containerRef}
                            isResizing={isResizing}
                            minSize={minSize}
                            position={cursorPosition}
                            providerRef={providerRef}
                            resizeDimensions={resizeDimensions}
                            resizeFunction={resizeFunction}
                            rotation={rotation}
                            setIsResizing={setIsResizing}
                            setResizeDimensions={setResizeDimensions}
                            setWrapperParams={setWrapperParams}
                            style={resizeHandleStyle}
                            styleMobile={resizeHandleStyleMobile}
                            wrapperParams={wrapperParams}
                        />
                    )
                })}
                <div className="resize-container-child-wrapper">
                    <div style={{ transform: dragLayerChildTransform || childTransform }}>
                        {React.Children.map(children, child => {
                            return React.cloneElement(child, { ref: childRef })
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

TransformableDraggable.defaultProps = {
    aspectRatio: 1,
    initialPosition: { top: 0, left: 0 },
    lockAspectRatio: false,
    minWidth: 70,
    minHeight: 70,
}
