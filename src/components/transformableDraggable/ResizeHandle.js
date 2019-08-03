import React, { useEffect, useRef, useState } from 'react'
import { utils } from '../../utils'
import './styles.scss'

const INITIAL_PAGE_COORDS = { pageX: 0, pageY: 0 }
const INITIAL_RESIZE_DIMENSIONS = { top: 0, right: 0, bottom: 0, left: 0 }

const isMobile = utils.isMobile()

const getPageCoordinates = event => {
    if (isMobile) {
        const { touches } = event

        if (touches.length > 1) {
            return
        }

        const [touch] = touches

        return touch
    }
    return event
}

export const ResizeHandle = ({
    containerRef,
    isResizing,
    minSize,
    position,
    providerRef,
    resizeDimensions,
    resizeFunction,
    rotation,
    setIsResizing,
    setResizeDimensions,
    setWrapperParams,
    style,
    styleMobile,
    wrapperParams,
}) => {
    const [initialPageCoords, setInitialPageCoords] = useState(INITIAL_PAGE_COORDS)
    const [mouseDown, setMouseDown] = useState(false)

    const cursorRef = useRef()

    useEffect(() => {
        const listenerCallback = event => {
            if (isMobile) {
                event.preventDefault()
            }

            if (!mouseDown) {
                const { pageX, pageY } = getPageCoordinates(event)

                setIsResizing(true)
                setInitialPageCoords({ pageX, pageY })
                setMouseDown(true)
            }
        }

        const cursorRefCurrent = cursorRef.current

        cursorRefCurrent.addEventListener(isMobile ? 'touchstart' : 'mousedown', listenerCallback)

        return () =>
            cursorRefCurrent.removeEventListener(
                isMobile ? 'touchstart' : 'mousedown',
                listenerCallback
            )
    }, [mouseDown, position, resizeDimensions, rotation, setIsResizing])

    useEffect(() => {
        const listenerCallback = event => {
            if (isMobile) {
                event.preventDefault()
            }

            if (mouseDown) {
                const { pageX, pageY } = getPageCoordinates(event)

                const dragDeltaX = pageX - initialPageCoords.pageX
                const dragDeltaY = pageY - initialPageCoords.pageY

                const dragLength = Math.sqrt(Math.pow(dragDeltaX, 2) + Math.pow(dragDeltaY, 2))
                const dragAngle = Math.atan(dragDeltaY / dragDeltaX) || 0
                const rotationRad = (rotation * Math.PI) / 180

                const adjustedDragAngle = utils.getOffsetDragAngle(
                    dragDeltaX,
                    dragDeltaY,
                    dragAngle,
                    position
                )

                const relativeDragAngle = adjustedDragAngle - rotationRad
                const adjustedDeltaX = Math.round(dragLength * Math.cos(relativeDragAngle))
                const adjustedDeltaY = Math.round(dragLength * Math.sin(relativeDragAngle))

                const { width, height } = containerRef.current.getBoundingClientRect()

                const { adjustedWidth, adjustedHeight } = utils.getAngleAdjustedDimensions(
                    width,
                    height,
                    rotation
                )

                const { width: wrapperWidth, height: wrapperHeight } = wrapperParams

                const newResizeDimensions = resizeFunction(
                    adjustedDeltaX,
                    adjustedDeltaY,
                    wrapperWidth,
                    wrapperHeight,
                    containerRef,
                    { minSize }
                )

                setResizeDimensions({
                    ...newResizeDimensions,
                    width: adjustedWidth,
                    height: adjustedHeight,
                })
            }
        }

        const providerRefCurrent = providerRef.current

        providerRefCurrent.addEventListener(isMobile ? 'touchmove' : 'mousemove', listenerCallback)

        return () =>
            providerRefCurrent.removeEventListener(
                isMobile ? 'touchmove' : 'mousemove',
                listenerCallback,
                isMobile ? { passive: false } : {}
            )
    }, [
        containerRef,
        initialPageCoords.pageX,
        initialPageCoords.pageY,
        minSize,
        mouseDown,
        position,
        providerRef,
        resizeDimensions,
        resizeFunction,
        rotation,
        setResizeDimensions,
        wrapperParams,
    ])

    useEffect(() => {
        const listenerCallback = () => {
            if (mouseDown) {
                setMouseDown(false)

                const { width, height, top, left } = containerRef.current.getBoundingClientRect()
                const {
                    top: providerTop,
                    left: providerLeft,
                } = providerRef.current.getBoundingClientRect()

                const {
                    adjustedWidth,
                    adjustedHeight,
                    widthDelta,
                    heightDelta,
                } = utils.getAngleAdjustedDimensions(width, height, rotation)

                setWrapperParams({
                    width: adjustedWidth,
                    height: adjustedHeight,
                    top: top - providerTop + heightDelta / 2,
                    left: left - providerLeft + widthDelta / 2,
                })

                setResizeDimensions({ ...resizeDimensions, ...INITIAL_RESIZE_DIMENSIONS })
                setInitialPageCoords(INITIAL_PAGE_COORDS)
                setIsResizing(false)
            }
        }

        const providerRefCurrent = providerRef.current

        providerRefCurrent.addEventListener(isMobile ? 'touchend' : 'mouseup', listenerCallback)
        !isMobile && providerRefCurrent.addEventListener('mouseleave', listenerCallback)

        return () => {
            providerRefCurrent.removeEventListener(
                isMobile ? 'touchend' : 'mouseup',
                listenerCallback
            )
            !isMobile && providerRefCurrent.removeEventListener('mouseleave', listenerCallback)
        }
    }, [
        containerRef,
        mouseDown,
        position,
        providerRef,
        resizeDimensions,
        rotation,
        setIsResizing,
        setResizeDimensions,
        setWrapperParams,
    ])

    return (
        <div
            ref={cursorRef}
            className={`resize-handle--${position} ${
                isResizing
                    ? mouseDown
                        ? 'resize-handle--selected'
                        : 'resize-handle--drag-not-selected'
                    : ''
            } ${isMobile ? 'resize-handle--mobile' : ''}`}
            style={isMobile ? styleMobile : style}
        />
    )
}
