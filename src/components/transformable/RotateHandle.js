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

                    const { scrollX, scrollY } = window

                    setIsRotating(true)
                    setCenterCoords({
                        centerX: left + scrollX + width / 2,
                        centerY: top + scrollY + height / 2,
                    })
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
                    const { centerX, centerY } = centerCoords

                    const pageDeltaX = pageX - centerX
                    const pageDeltaY = centerY - pageY

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
            centerCoords,
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

        const color =
            (style && style.color) || (styleMobile && styleMobile.color)
                ? { color: style.fill }
                : {}

        const styleWithColorProp = {
            ...(isMobile ? styleMobile : style),
            ...color,
        }

        return (
            <div
                ref={cursorRef}
                className={`resize-container-rotate ${
                    isResizing ? 'resize-container-rotate--resizing' : ''
                }`}
                style={{
                    ...handlePosition,
                }}
            >
                <svg
                    id="react-transormable-draggable-rotate-handle"
                    style={styleWithColorProp}
                    viewBox="0 0 24 24"
                >
                    <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                </svg>
            </div>
        )
    },
    utils.isEqual
)
