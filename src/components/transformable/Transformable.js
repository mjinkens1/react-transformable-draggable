import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import throttle from 'lodash.throttle'

// Components/Context
import { ApiContext, ApiLayer } from '../apiLayer/ApiLayer'
import { TransformableContext } from '../transformableTarget/TransformableTarget'
import { ResizeHandle } from '../handles/ResizeHandle'
import { RotateHandle } from '../handles/RotateHandle'
import { defaultProps } from '../apiLayer/ApiLayer'

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

const isMobile = utils.isMobile()

const getOpacity = (isDragging, isDragLayer, dragLayerIsDragging, initialized) => {
    if (isDragLayer) {
        return dragLayerIsDragging ? 1 : 0
    } else {
        return isDragging || !initialized ? 0 : 1
    }
}

const getMinHeight = (lockAspectRatio, aspectRatio, minWidth, minHeight) =>
    lockAspectRatio ? minWidth / aspectRatio : minHeight

const TransformableCore = ({
    children,
    dragLayerBounds,
    dragLayerChildTransform,
    dragLayerIsDragging,
    dragLayerParams,
    id,
    isDragLayer,
}) => {
    const {
        className,
        customType,
        boundingBoxStyle,
        boundingBoxStyleMobile,
        hideBoundingBox,
        hideHandles,
        initialPosition,
        lockAspectRatio,
        maxHeight,
        maxWidth,
        minHeight,
        minWidth,
        style,
        usePinchMobile,
    } = useContext(ApiContext)

    const {
        dragUpdate,
        lastZIndex,
        providerRef,
        setCurrentDragSource,
        setDragUpdate,
        setLastZIndex,
    } = useContext(TransformableContext)

    const [aspectRatio, setAspectRatio] = useState(INITIAL_ASPECT_RATIO)
    const [dragDisabled, setDragDisabled] = useState(false)
    const [initialDimensions, setInitialDimensions] = useState(INITIAL_DIMENSIONS)
    const [isResizing, setIsResizing] = useState(false)
    const [isRotating, setIsRotating] = useState(false)
    const [initialized, setInitialized] = useState(false)
    const [resizeDimensions, setResizeDimensions] = useState(INITIAL_DIMENSIONS)
    const [rotation, setRotation] = useState(0)
    const [wrapperParams, setWrapperParams] = useState(INITIAL_DIMENSIONS)
    const [zIndex, setZIndex] = useState(0)

    const containerRef = useRef()
    const childRef = useRef()
    const initialPinch = useRef()
    const currentPinchRatio = useRef()
    const lastPinchRatio = useRef(1)

    const cursors = lockAspectRatio ? cursorPositionsAspectLocked : cursorPositions

    const { width: initialWidth, height: initialHeight } = initialDimensions
    const { width, height, ...resizeBounds } = resizeDimensions
    const scaleX = width / initialWidth
    const scaleY = height / initialHeight
    const rotateTransform = `rotateZ(${rotation}deg)`

    const clickCallback = useCallback(() => {
        const nextZIndex = lastZIndex + 1
        const { scrollX, scrollY } = window

        setCurrentDragSource({ dragSourceId: id, pageScroll: { scrollX, scrollY } })

        setZIndex(nextZIndex)
        setLastZIndex(nextZIndex)
    }, [lastZIndex, setLastZIndex])

    const [{ isDragging }, drag, preview] = useDrag({
        item: {
            id,
            type: 'TRANSFORMABLE_DRAGGABLE',
            customType,
            wrapperParams,
            resizeDimensions,
            initialDimensions,
            rotation,
            lockAspectRatio,
            minHeight: getMinHeight(lockAspectRatio, aspectRatio, minWidth, minHeight),
            minWidth,
        },
        canDrag: !isResizing && !isRotating && !dragDisabled,
        collect: monitor => {
            return { isDragging: monitor.isDragging() }
        },
        options: { arePropsEqual: utils.isEqual },
    })

    useEffect(() => {
        preview(getEmptyImage())
    }, [])

    useEffect(() => {
        if (!initialized) {
            React.Children.only(children)

            const childDimensions = {
                width: Math.max(childRef.current.clientWidth, minWidth),
                height: Math.max(childRef.current.clientHeight, minHeight),
            }

            const childAspectRatio = childDimensions.width / childDimensions.height

            const initialPositionDerived =
                typeof initialPosition === 'string'
                    ? utils.getPositionFromString(initialPosition, providerRef, childDimensions)
                    : initialPosition

            setAspectRatio(childAspectRatio)
            setInitialDimensions(childDimensions)
            setResizeDimensions({ ...childDimensions, top: 0, right: 0, bottom: 0, left: 0 })
            setWrapperParams({ ...childDimensions, ...initialPositionDerived })

            if (!isDragLayer) {
                const nextZindex = lastZIndex + 1
                setLastZIndex(nextZindex)
                setZIndex(nextZindex)
            }

            setInitialized(true)
        }
    }, [
        children,
        dragLayerBounds,
        dragLayerParams,
        id,
        initialPosition,
        initialized,
        isDragLayer,
        lastZIndex,
        minHeight,
        minWidth,
        providerRef,
        setCurrentDragSource,
        setLastZIndex,
        zIndex,
    ])

    useLayoutEffect(() => {
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

    useEffect(() => {
        const listenerCallback = event => {
            const { touches } = event

            if (touches.length > 1) {
                setDragDisabled(true)
            } else {
                setDragDisabled(false)
            }
        }

        document.body.addEventListener('touchstart', listenerCallback)

        return () => {
            document.body.removeEventListener('touchstart', listenerCallback)
        }
    }, [])

    useEffect(() => {
        const mobileCallback = event => {
            const isRenderChild = event.target.id === id || event.target.parentElement.id === id

            if (isRenderChild) {
                clickCallback()
            }
        }

        const containerRefCurrent = containerRef.current
        const body = document.querySelector('body')

        containerRefCurrent.addEventListener('mousedown', clickCallback)

        if (isMobile) {
            body.addEventListener('touchstart', mobileCallback)
        }

        return () => {
            containerRefCurrent.removeEventListener('mousedown', clickCallback)
            if (isMobile) {
                body.removeEventListener('touchstart', mobileCallback)
            }
        }
    }, [clickCallback, containerRef])

    useEffect(() => {
        if (usePinchMobile || true) {
            const childRefCurrent = childRef.current

            const listenerCallback = event => {
                event.preventDefault()

                const { touches } = event

                const isTransformableChild = Object.values(touches).every(({ target }) => {
                    return id === target.parentNode.id
                })

                if (touches.length !== 2 || !isTransformableChild) {
                    return
                }

                const { 0: touch1, 1: touch2 } = touches

                const { pageX: pageX1, pageY: pagePageY1 } = touch1
                const { pageX: pageX2, pageY: pagePageY2 } = touch2

                const deltaX = pageX2 - pageX1
                const deltaY = pagePageY2 - pagePageY1

                const pinchMagnitude = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))

                initialPinch.current = pinchMagnitude
            }

            childRefCurrent.addEventListener('touchstart', listenerCallback)

            return () => {
                childRefCurrent.removeEventListener('touchstart', listenerCallback)
            }
        }
    }, [childRef, id, lastPinchRatio, usePinchMobile])

    useEffect(() => {
        if (usePinchMobile) {
            const childRefCurrent = childRef.current

            const listenerCallback = event => {
                const { touches } = event

                const isTransformableChild = Object.values(touches).every(({ target }) => {
                    return id === target.parentNode.id
                })

                if (touches.length !== 2 || !isTransformableChild) {
                    return
                }

                event.preventDefault()
                setIsResizing(true)

                const { 0: touch1, 1: touch2 } = touches

                const { pageX: pageX1, pageY: pagePageY1 } = touch1
                const { pageX: pageX2, pageY: pagePageY2 } = touch2

                const deltaX = pageX2 - pageX1
                const deltaY = pagePageY2 - pagePageY1

                const pinchMagnitude = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))
                const pinchRatio = (pinchMagnitude / initialPinch.current) * lastPinchRatio.current

                currentPinchRatio.current = pinchRatio

                const { width, height } = containerRef.current.getBoundingClientRect()

                const { adjustedWidth, adjustedHeight } = utils.getAngleAdjustedDimensions(
                    width,
                    height,
                    rotation
                )

                const containerDeltaX = adjustedWidth * pinchRatio - adjustedWidth
                const containerDeltaY = adjustedHeight * pinchRatio - adjustedHeight

                const { width: wrapperWidth, height: wrapperHeight } = wrapperParams

                const resizeFunction = utils.getResizeFunction('pinch')

                const newResizeDimensions = resizeFunction(
                    -containerDeltaX / pinchRatio,
                    -containerDeltaY / pinchRatio,
                    wrapperWidth,
                    wrapperHeight,
                    { aspectRatio, lockAspectRatio, minHeight, minWidth }
                )

                const dimensionsValid = utils.validateDimensions({
                    ...newResizeDimensions,
                    width: adjustedWidth,
                    height: adjustedHeight,
                })

                const { innerWidth, innerHeight } = window

                if (!dimensionsValid) {
                    return
                }
                // Resize the element
                setResizeDimensions({
                    ...newResizeDimensions,
                    width: adjustedWidth,
                    height: adjustedHeight,
                })
            }

            childRefCurrent.addEventListener('touchmove', listenerCallback)

            return () => {
                childRefCurrent.removeEventListener('touchmove', listenerCallback)
            }
        }
    }, [
        childRef,
        containerRef,
        currentPinchRatio,
        initialPinch,
        lastPinchRatio,
        rotation,
        setIsResizing,
        usePinchMobile,
    ])

    useEffect(() => {
        if (usePinchMobile) {
            const childRefCurrent = childRef.current

            const listenerCallback = event => {
                event.preventDefault()
                setIsResizing(false)

                lastPinchRatio.current = currentPinchRatio.current
            }

            childRefCurrent.addEventListener('touchend', listenerCallback)

            return () => {
                childRefCurrent.removeEventListener('touchend', listenerCallback)
            }
        }
    }, [childRef, currentPinchRatio, initialPinch, lastPinchRatio, setIsResizing, usePinchMobile])

    const childTransform = lockAspectRatio
        ? `scale(${Math.max(width / initialWidth, height / initialHeight)})`
        : `scale(${scaleX}, ${scaleY})`

    const wrapperStyle = {
        ...wrapperParams,
        transform: rotateTransform,
        ...dragLayerParams,
        opacity: getOpacity(isDragging, isDragLayer, dragLayerIsDragging, initialized),
        pointerEvents: isDragLayer ? 'none' : 'auto',
        zIndex,
    }

    const containerStyle = {
        border: '1px solid',
        border: hideBoundingBox ? 'none' : null,
        ...(hideBoundingBox ? {} : boundingBoxStyle),
        ...resizeBounds,
        ...dragLayerBounds,
        minWidth,
        minHeight: getMinHeight(lockAspectRatio, aspectRatio, minWidth, minHeight),
        maxWidth,
        maxHeight,
    }

    const childContainerStyle = { transform: dragLayerChildTransform || childTransform }

    return (
        <div ref={drag} className="resize-container-wrapper" style={wrapperStyle}>
            <div ref={containerRef} className="resize-container" style={containerStyle}>
                {!hideHandles && (
                    <RotateHandle
                        clickCallback={clickCallback}
                        containerRef={containerRef}
                        containerPosition={wrapperParams}
                        isResizing={isResizing}
                        isRotating={isRotating}
                        providerRef={providerRef}
                        rotation={rotation}
                        setIsRotating={setIsRotating}
                        setRotation={setRotation}
                    />
                )}
                {!usePinchMobile &&
                    cursors.map(cursorPosition => {
                        const resizeFunction = utils.getResizeFunction(
                            cursorPosition,
                            lockAspectRatio
                        )

                        return (
                            !hideHandles && (
                                <ResizeHandle
                                    key={cursorPosition}
                                    aspectRatio={aspectRatio}
                                    clickCallback={clickCallback}
                                    containerRef={containerRef}
                                    isResizing={isResizing}
                                    position={cursorPosition}
                                    providerRef={providerRef}
                                    resizeDimensions={resizeDimensions}
                                    resizeFunction={resizeFunction}
                                    rotation={rotation}
                                    setIsResizing={setIsResizing}
                                    setResizeDimensions={setResizeDimensions}
                                    setWrapperParams={setWrapperParams}
                                    wrapperParams={wrapperParams}
                                />
                            )
                        )
                    })}
                <div className={`resize-container-child-wrapper ${className || ''}`} style={style}>
                    <div id={id} ref={childRef} style={childContainerStyle}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const Transformable = props => (
    <ApiLayer {...props}>
        <TransformableCore {...props} />
    </ApiLayer>
)

Transformable.defaultProps = defaultProps
