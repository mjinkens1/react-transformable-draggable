import React, { useEffect, useRef, useState } from 'react'
import { useDrag } from 'react-dnd'

// Components
import { ResizeHandle } from './ResizeHandle'
// import { RotateHandle } from './RotateHandle'

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
    id,
    initialPosition,
    lockAspectRatio,
    providerRef,
    setDragUpdate,
}) => {
    const [aspectRatio, setAspectRatio] = useState(INITIAL_ASPECT_RATIO)
    const [initialDimensions, setInitialDimensions] = useState(INITIAL_DIMENSIONS)
    const [isResizing, setIsResizing] = useState(false)
    // const [isRotating, setIsRotating] = useState(false)
    const [resizeDimensions, setResizeDimensions] = useState(INITIAL_DIMENSIONS)
    // const [rotation, setRotation] = useState(0)
    const [wrapperParams, setWrapperParams] = useState(INITIAL_DIMENSIONS)
    const [initialized, setInitialized] = useState(false)

    const containerRef = useRef()
    const childRef = useRef()

    const [{ isDragging }, drag] = useDrag({
        item: { id, type: 'TRANSFORMABLE_DRAGGABLE' },
        canDrag: !isResizing, // && !isRotating,
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    })

    useEffect(() => {
        React.Children.only(children)

        const childDimensions = {
            width: childRef.current.clientWidth,
            height: childRef.current.clientHeight,
        }

        const { top, left } = containerRef.current.getBoundingClientRect()
        const { top: providerTop, left: providerLeft } = providerRef.current.getBoundingClientRect()

        const childAspectRatio = childDimensions.width / childDimensions.height

        if (!initialized) {
            setAspectRatio(childAspectRatio)
            setInitialDimensions(childDimensions)
            setResizeDimensions(childDimensions)
            setWrapperParams({
                ...childDimensions,
                top: top - providerTop,
                left: left - providerLeft,
            })

            setInitialized(true)
        }
    }, [children, initialized, providerRef])

    useEffect(() => {
        if (dragUpdate) {
            const { id: updateId, ...positionUpdate } = dragUpdate

            if (id === updateId) {
                const { top, left, ...wrapperDimensions } = wrapperParams
                const { x, y } = positionUpdate

                console.log('POS', { ...wrapperDimensions, top: top + y, left: left + x })
                setWrapperParams({ ...wrapperDimensions, top: top + y, left: left + x })
                setDragUpdate(null)
            }
        }
    }, [id, dragUpdate, wrapperParams, setDragUpdate])

    const { width: initialWidth, height: initialHeight } = initialDimensions
    const { width, height, ...resizeBounds } = resizeDimensions
    // const { top } = wrapperParams

    const scaleX = width / initialWidth
    const scaleY = height / initialHeight

    // const rotateTransform = `rotateZ(${rotation}deg)`
    const childTransform = `scale(${scaleX}, ${scaleY})`

    const cursors = lockAspectRatio ? cursorPositionsAspectLocked : cursorPositions

    return (
        <div
            ref={drag}
            className="resize-container-wrapper"
            style={{
                ...initialPosition,
                ...wrapperParams,
                // transform: rotateTransform,
                opacity: isDragging ? 0 : 1,
            }}
        >
            <div ref={containerRef} className="resize-container" style={resizeBounds}>
                {/* <RotateHandle
                    containerRef={containerRef}
                    containerTop={top}
                    providerRef={providerRef}
                    setIsRotating={setIsRotating}
                    setRotation={setRotation}
                /> */}
                {cursors.map(cursorPosition => {
                    const resizeFunction = utils.getResizeFunction(cursorPosition, lockAspectRatio)

                    return (
                        <ResizeHandle
                            key={cursorPosition}
                            aspectRatio={aspectRatio}
                            containerRef={containerRef}
                            position={cursorPosition}
                            providerRef={providerRef}
                            resizeDimensions={resizeDimensions}
                            resizeFunction={resizeFunction}
                            setIsResizing={setIsResizing}
                            setResizeDimensions={setResizeDimensions}
                            setWrapperParams={setWrapperParams}
                        />
                    )
                })}
                <div className="resize-container-child-wrapper">
                    <div style={{ transform: childTransform }}>
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
    initialPosition: { top: 0, left: 0 },
    lockAspectRatio: false,
}
