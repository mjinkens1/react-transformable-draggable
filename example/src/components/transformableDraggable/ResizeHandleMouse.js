import React, { useEffect, useRef, useState } from 'react'
import { utils } from '../../utils'
import './styles.scss'

const INITIAL_PAGE_COORDS = { pageX: 0, pageY: 0 }
const INITIAL_RESIZE_DIMENSIONS = { top: 0, right: 0, bottom: 0, left: 0 }

const getAngleAdjustedDimensions = (angledWidth, angledHeight, angle) => {
    console.group('ANGLE ADJUST DATA')
    const angleRad = (() => {
        console.log('ANGLE DEGREES', angle)
        if (angle <= 90) {
            return (angle * Math.PI) / 180
        } else if (angle > 90 && angle < 180) {
            return ((180 - angle) * Math.PI) / 180
        } else if (angle > 180 && angle < 270) {
            return ((270 - angle) * Math.PI) / 180
        } else if (angle > 270 && angle <= 360) {
            return ((360 - angle) * Math.PI) / 180
        }
    })()

    const height = Math.round(
        (angledHeight * Math.cos(angleRad) - angledWidth * Math.sin(angleRad)) /
            (Math.pow(Math.cos(angleRad), 2) - Math.pow(Math.sin(angleRad), 2))
    )

    const width = Math.round(
        (angledWidth * Math.cos(angleRad) - angledHeight * Math.sin(angleRad)) /
            (Math.pow(Math.cos(angleRad), 2) - Math.pow(Math.sin(angleRad), 2))
    )
    console.log('ANGLE RADIANS', angleRad)
    console.log('ANGLE ADJUSTED DIMENSIONS', { width, height })
    console.groupEnd()
    return { width, height }
}

export const ResizeHandleMouse = ({
    containerRef,
    position,
    providerRef,
    resizeDimensions,
    resizeFunction,
    rotation,
    setIsResizing,
    setResizeDimensions,
    setWrapperParams,
}) => {
    const [initialPageCoords, setInitialPageCoords] = useState(INITIAL_PAGE_COORDS)
    const [mouseDown, setMouseDown] = useState(false)

    const cursorRef = useRef()

    useEffect(() => {
        const listenerCallback = ({ pageX, pageY }) => {
            if (!mouseDown) {
                setIsResizing(true)
                setInitialPageCoords({ pageX, pageY })
                setMouseDown(true)
            }
        }

        const cursorRefCurrent = cursorRef.current

        cursorRefCurrent.addEventListener('mousedown', listenerCallback)

        return () => cursorRefCurrent.removeEventListener('mousedown', listenerCallback)
    }, [mouseDown, position, resizeDimensions, rotation, setIsResizing])

    useEffect(() => {
        const listenerCallback = ({ pageX, pageY }) => {
            if (mouseDown) {
                const dragDeltaX = pageX - initialPageCoords.pageX
                const dragDeltaY = pageY - initialPageCoords.pageY

                const dragLength = Math.sqrt(Math.pow(dragDeltaX, 2) + Math.pow(dragDeltaY, 2))
                const dragAngle = Math.atan(dragDeltaY / dragDeltaX)
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

                const newResizeDimensions = resizeFunction(adjustedDeltaX, adjustedDeltaY)

                const { width, height } = containerRef.current.getBoundingClientRect()

                const { width: adjustedWidth, height: adjustedHeight } = getAngleAdjustedDimensions(
                    width,
                    height,
                    rotation
                )

                setResizeDimensions({
                    ...newResizeDimensions,
                    width: adjustedWidth,
                    height: adjustedHeight,
                })
            }
        }

        const providerRefCurrent = providerRef.current

        providerRefCurrent.addEventListener('mousemove', listenerCallback)

        return () => providerRefCurrent.removeEventListener('mousemove', listenerCallback)
    }, [
        containerRef,
        initialPageCoords.pageX,
        initialPageCoords.pageY,
        mouseDown,
        position,
        providerRef,
        resizeDimensions,
        resizeFunction,
        rotation,
        setResizeDimensions,
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

                const { width: adjustedWidth, height: adjustedHeight } = getAngleAdjustedDimensions(
                    width,
                    height,
                    rotation
                )

                const angleRad = (rotation * Math.PI) / 180

                setWrapperParams({
                    width: adjustedWidth,
                    height: adjustedHeight,
                    top: top - (providerTop - (height * Math.sin(angleRad)) / 2),
                    left: left - (providerLeft + (height * Math.sin(angleRad)) / 2),
                })

                setResizeDimensions({ ...resizeDimensions, ...INITIAL_RESIZE_DIMENSIONS })
                setInitialPageCoords(INITIAL_PAGE_COORDS)
                setIsResizing(false)
            }
        }

        const providerRefCurrent = providerRef.current

        providerRefCurrent.addEventListener('mouseup', listenerCallback)

        return () => providerRefCurrent.removeEventListener('mouseup', listenerCallback)
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

    useEffect(() => {
        const listenerCallback = () => {
            if (mouseDown) {
                const { width, height, top, left } = containerRef.current.getBoundingClientRect()
                const {
                    top: providerTop,
                    left: providerLeft,
                } = providerRef.current.getBoundingClientRect()

                const { width: adjustedWidth, height: adjustedHeight } = getAngleAdjustedDimensions(
                    width,
                    height,
                    rotation
                )

                setMouseDown(false)
                setIsResizing(false)
                setWrapperParams({
                    width: adjustedWidth,
                    height: adjustedHeight,
                    top: top - providerTop,
                    left: left - providerLeft,
                })
                setResizeDimensions({ ...resizeDimensions, ...INITIAL_RESIZE_DIMENSIONS })
                setInitialPageCoords(INITIAL_PAGE_COORDS)
            }
        }

        const providerRefCurrent = providerRef.current

        providerRefCurrent.addEventListener('mouseleave', listenerCallback)

        return () => providerRefCurrent.removeEventListener('mouseleave', listenerCallback)
    }, [
        containerRef,
        mouseDown,
        providerRef,
        resizeDimensions,
        rotation,
        setIsResizing,
        setResizeDimensions,
        setWrapperParams,
    ])

    return <div ref={cursorRef} className={`resize-handle--${position}`} />
}
