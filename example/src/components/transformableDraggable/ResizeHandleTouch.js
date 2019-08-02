import React, { useEffect, useRef, useState } from 'react'
import './styles.scss'

const INITIAL_PAGE_COORDS = { pageX: 0, pageY: 0 }
const INITIAL_RESIZE_DIMENSIONS = { top: 0, right: 0, bottom: 0, left: 0 }

export const ResizeHandleTouch = ({
    containerRef,
    position,
    providerRef,
    resizeDimensions,
    resizeFunction,
    setIsResizing,
    setResizeDimensions,
    setWrapperParams,
}) => {
    const [initialPageCoords, setInitialPageCoords] = useState(INITIAL_PAGE_COORDS)
    const [mouseDown, setMouseDown] = useState(false)

    const cursorRef = useRef()

    useEffect(() => {
        const listenerCallback = event => {
            event.preventDefault()

            const { touches } = event

            if (touches.length > 1) {
                return
            }

            const [touch] = touches
            const { pageX, pageY } = touch

            setIsResizing(true)
            setInitialPageCoords({ pageX, pageY })
            setMouseDown(true)
        }

        const cursorRefCurrent = cursorRef.current

        cursorRefCurrent.addEventListener('touchstart', listenerCallback)

        return () => cursorRefCurrent.removeEventListener('touchstart', listenerCallback)
    }, [setIsResizing])

    useEffect(() => {
        const listenerCallback = () => {
            if (mouseDown) {
                setMouseDown(false)

                const { width, height, top, left } = containerRef.current.getBoundingClientRect()
                const {
                    top: providerTop,
                    left: providerLeft,
                } = providerRef.current.getBoundingClientRect()

                setWrapperParams({
                    width,
                    height,
                    top: top - providerTop,
                    left: left - providerLeft,
                })

                setResizeDimensions({ ...resizeDimensions, ...INITIAL_RESIZE_DIMENSIONS })
                setInitialPageCoords(INITIAL_PAGE_COORDS)
                setIsResizing(false)
            }
        }

        const providerRefCurrent = providerRef.current

        providerRefCurrent.addEventListener('touchend', listenerCallback, { passive: false })

        return () => providerRefCurrent.removeEventListener('touchend', listenerCallback)
    }, [
        containerRef,
        mouseDown,
        providerRef,
        resizeDimensions,
        setIsResizing,
        setResizeDimensions,
        setWrapperParams,
    ])

    useEffect(() => {
        const listenerCallback = event => {
            if (mouseDown) {
                event.preventDefault()

                const { touches } = event

                if (touches.length > 1) {
                    return
                }

                const [touch] = touches
                const { pageX, pageY } = touch

                const newResizeDimensions = resizeFunction(
                    pageX - initialPageCoords.pageX,
                    pageY - initialPageCoords.pageY
                )

                const { width, height } = containerRef.current.getBoundingClientRect()

                setResizeDimensions({ ...newResizeDimensions, width, height })
            }
        }

        const providerRefCurrent = providerRef.current

        providerRefCurrent.addEventListener('touchmove', listenerCallback, { passive: false })

        return () => providerRefCurrent.removeEventListener('touchmove', listenerCallback)
    }, [
        containerRef,
        initialPageCoords.pageX,
        initialPageCoords.pageY,
        mouseDown,
        providerRef,
        resizeDimensions,
        resizeFunction,
        setResizeDimensions,
    ])

    return (
        <div
            ref={cursorRef}
            className={`resize-handle--${position}`}
            style={{
                width: 30,
                height: 30,
                marginTop: position === 'left' || position === 'right' ? -7.5 : 0,
                marginLeft: position === 'top-center' || position === 'bottom-center' ? -7.5 : 0,
            }}
        />
    )
}
