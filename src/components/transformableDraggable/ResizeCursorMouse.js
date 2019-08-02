import React, { useEffect, useRef, useState } from 'react'
import './styles.scss'

const INITIAL_PAGE_COORDS = { pageX: 0, pageY: 0 }
const INITIAL_RESIZE_DIMENSIONS = { top: 0, right: 0, bottom: 0, left: 0 }

export const ResizeHandleMouse = ({
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
            const { pageX, pageY } = event

            setIsResizing(true)
            setMouseDown(true)
            setInitialPageCoords({ pageX, pageY })
        }

        const cursorRefCurrent = cursorRef.current

        cursorRefCurrent.addEventListener('mousedown', listenerCallback)

        return () => cursorRefCurrent.removeEventListener('mousedown', listenerCallback)
    }, [setIsResizing])

    useEffect(() => {
        const listenerCallback = event => {
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
                setResizeDimensions(INITIAL_RESIZE_DIMENSIONS)
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
        providerRef,
        resizeDimensions,
        setIsResizing,
        setResizeDimensions,
        setWrapperParams,
    ])

    useEffect(() => {
        const listenerCallback = event => {
            if (mouseDown) {
                const { width, height, top, left } = containerRef.current.getBoundingClientRect()
                const {
                    top: providerTop,
                    left: providerLeft,
                } = providerRef.current.getBoundingClientRect()

                setMouseDown(false)
                setIsResizing(false)
                setWrapperParams({
                    width,
                    height,
                    top: top - providerTop,
                    left: left - providerLeft,
                })
                setResizeDimensions(INITIAL_RESIZE_DIMENSIONS)
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
        setIsResizing,
        setResizeDimensions,
        setWrapperParams,
    ])

    useEffect(() => {
        const listenerCallback = event => {
            if (mouseDown) {
                const { pageX, pageY } = event

                const newResizeDimensions = resizeFunction(
                    pageX - initialPageCoords.pageX,
                    pageY - initialPageCoords.pageY
                )

                const { width, height } = containerRef.current.getBoundingClientRect()

                setResizeDimensions({ ...newResizeDimensions, width, height })
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
        providerRef,
        resizeDimensions,
        resizeFunction,
        setResizeDimensions,
    ])

    return <div ref={cursorRef} className={`resize-handle--${position}`} />
}
