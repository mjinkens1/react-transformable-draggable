import React, { memo, useContext, useEffect, useRef, useState } from 'react'

// Context
import { ApiContext } from '../apiLayer/ApiLayer'

// Utils
import { utils } from '../../utils'

const INITIAL_CENTER_COORDS = { pageX: 0, pageY: 0 }

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

const isMobile = utils.isMobile()

export const RotateHandle = memo(
    ({
        clickCallback,
        containerRef,
        containerPosition,
        isResizing,
        isRotating,
        providerRef,
        rotation,
        setIsRotating,
        setRotation,
    }) => {
        const [centerCoords, setCenterCoords] = useState(INITIAL_CENTER_COORDS)
        const [handlePosition] = useState({ top: -35 })
        const [mouseDown, setMouseDown] = useState(false)

        const cursorRef = useRef()

        const { style, styleMobile } = useContext(ApiContext)

        useEffect(() => {
            const cursorRefCurrent = cursorRef.current

            cursorRefCurrent.addEventListener(
                utils.isMobile() ? 'touchstart' : 'mousedown',
                clickCallback
            )

            return () =>
                cursorRefCurrent.removeEventListener(
                    utils.isMobile() ? 'touchstart' : 'mousedown',
                    clickCallback
                )
        }, [clickCallback, containerRef])

        useEffect(() => {
            const listenerCallback = () => {
                if (!mouseDown) {
                    const {
                        top,
                        left,
                        width,
                        height,
                    } = containerRef.current.getBoundingClientRect()

                    setIsRotating(true)
                    setCenterCoords({ pageX: left + width / 2, pageY: top + height / 2 })
                    setMouseDown(true)
                }
            }

            const cursorRefCurrent = cursorRef.current

            cursorRefCurrent.addEventListener(
                isMobile ? 'touchstart' : 'mousedown',
                listenerCallback
            )

            return () =>
                cursorRefCurrent.removeEventListener(
                    isMobile ? 'touchstart' : 'mousedown',
                    listenerCallback
                )
        }, [containerRef, mouseDown, setIsRotating])

        useEffect(() => {
            const listenerCallback = event => {
                if (mouseDown) {
                    const { pageX, pageY } = getPageCoordinates(event)

                    const pageDeltaX = pageX - centerCoords.pageX
                    const pageDeltaY = centerCoords.pageY - pageY

                    const dragAngle = utils.getOffsetAngle(
                        pageDeltaX,
                        pageDeltaY,
                        Math.atan(pageDeltaY / pageDeltaX) * (180 / Math.PI)
                    )

                    setRotation(dragAngle)
                }
            }

            const providerRefCurrent = providerRef.current

            providerRefCurrent.addEventListener(
                isMobile ? 'touchmove' : 'mousemove',
                listenerCallback
            )

            return () =>
                providerRefCurrent.removeEventListener(
                    isMobile ? 'touchmove' : 'mousemove',
                    listenerCallback
                )
        }, [
            centerCoords.pageX,
            centerCoords.pageY,
            mouseDown,
            providerRef,
            rotation,
            setIsRotating,
            setRotation,
        ])

        useEffect(() => {
            const listenerCallback = () => {
                if (mouseDown) {
                    setIsRotating(false)
                    setMouseDown(false)
                    setCenterCoords(INITIAL_CENTER_COORDS)
                }
            }

            const providerRefCurrent = providerRef.current

            providerRefCurrent.addEventListener(isMobile ? 'touchend' : 'mouseup', listenerCallback)

            return () =>
                providerRefCurrent.removeEventListener(
                    isMobile ? 'touchend' : 'mouseup',
                    listenerCallback
                )
        }, [mouseDown, providerRef, setIsRotating])

        return (
            <i
                ref={cursorRef}
                className={`fas fa-undo resize-container-rotate ${
                    isResizing ? 'resize-container-rotate--resizing' : ''
                }`}
                style={{
                    ...(isMobile ? styleMobile : style),
                    ...handlePosition,
                }}
            />
        )
    },
    utils.isEqual
)
