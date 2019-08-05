import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import throttle from 'lodash.throttle'

// Components/Context
import { ApiContext, ApiLayer } from '../apiLayer/ApiLayer'
import { TransformableContext } from '../transformableTarget/TransformableTarget'
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
        hideBoundingBox,
        hideHandles,
        initialPosition,
        lockAspectRatio,
        maxHeight,
        maxWidth,
        minHeight,
        minWidth,
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

    const clickCallback = useCallback(() => {
        const nextZIndex = lastZIndex + 1

        setZIndex(nextZIndex)
        setLastZIndex(nextZIndex)
    }, [lastZIndex, setLastZIndex])

    const getMinHeight = () => (lockAspectRatio ? minWidth / aspectRatio : minHeight)

    const getOpacity = (isDragging, isDragLayer) => {
        if (isDragLayer) {
            return dragLayerIsDragging ? 1 : 0
        } else {
            return isDragging || !initialized ? 0 : 1
        }
    }

    const [{ isDragging }, drag, preview] = useDrag({
        item: {
            id,
            type: 'TRANSFORMABLE_DRAGGABLE',
            wrapperParams,
            resizeDimensions,
            initialDimensions,
            rotation,
            lockAspectRatio,
            minHeight: getMinHeight(),
            minWidth,
        },
        begin: () => {
            const { scrollX, scrollY } = window

            setCurrentDragSource({ dragSourceId: id, pageScroll: { scrollX, scrollY } })
        },
        canDrag: !isResizing && !isRotating,
        collect: monitor => ({ isDragging: monitor.isDragging() }),
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

    useEffect(() => {
        const containerRefCurrent = containerRef.current

        containerRefCurrent.addEventListener(
            utils.isMobile() ? 'touchstart' : 'mousedown',
            clickCallback
        )

        return () =>
            containerRefCurrent.removeEventListener(
                utils.isMobile() ? 'touchstart' : 'mousedown',
                clickCallback
            )
    }, [clickCallback, containerRef])

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
        const listenerCallback = throttle(() => {
            const { width, height } = childRef.current.getBoundingClientRect()
            const { width: wrapperWidth, height: wrapperHeight } = wrapperParams

            if (width !== wrapperWidth || height !== wrapperHeight) {
                setInitialized(false)
            }
        }, 50)

        window.addEventListener('resize', listenerCallback)

        return () => window.removeEventListener('resize', listenerCallback)
    }, [wrapperParams])

    const cursors = lockAspectRatio ? cursorPositionsAspectLocked : cursorPositions

    const { width: initialWidth, height: initialHeight } = initialDimensions
    const { width, height, ...resizeBounds } = resizeDimensions
    const scaleX = width / initialWidth
    const scaleY = height / initialHeight
    const rotateTransform = `rotateZ(${rotation}deg)`

    const childTransform = lockAspectRatio
        ? `scale(${Math.max(width / initialWidth, height / initialHeight)})`
        : `scale(${scaleX}, ${scaleY})`

    const wrapperStyle = {
        ...wrapperParams,
        transform: rotateTransform,
        ...dragLayerParams,
        opacity: getOpacity(isDragging, isDragLayer),
        pointerEvents: isDragLayer ? 'none' : 'auto',
        zIndex,
    }

    const containerStyle = {
        ...resizeBounds,
        ...dragLayerBounds,
        minWidth,
        minHeight: getMinHeight(),
        maxWidth,
        maxHeight,
        border: hideBoundingBox ? 'none' : null,
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
                {cursors.map(cursorPosition => {
                    const resizeFunction = utils.getResizeFunction(cursorPosition, lockAspectRatio)

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
                <div className="resize-container-child-wrapper">
                    <div ref={childRef} style={childContainerStyle}>
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
