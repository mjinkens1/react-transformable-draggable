import React, { useEffect, useRef, useState } from 'react'
import { utils } from '../../utils'

const INITIAL_CENTER_COORDS = { pageX: 0, pageY: 0 }

export const RotateHandleTouch = ({
    containerRef,
    containerTop,
    providerRef,
    rotation,
    setIsRotating,
    setRotation,
}) => {
    const [centerCoords, setCenterCoords] = useState(INITIAL_CENTER_COORDS)
    const [mouseDown, setMouseDown] = useState(false)

    const cursorRef = useRef()

    useEffect(() => {
        const listenerCallback = event => {
            const { top, left, width, height } = containerRef.current.getBoundingClientRect()

            setIsRotating(true)
            setMouseDown(true)
            setCenterCoords({ pageX: left + width / 2, pageY: top + height / 2 })
        }

        const cursorRefCurrent = cursorRef.current

        cursorRefCurrent.addEventListener('mousedown', listenerCallback)

        return () => cursorRefCurrent.removeEventListener('mousedown', listenerCallback)
    }, [containerRef, mouseDown, setIsRotating])

    useEffect(() => {
        const listenerCallback = event => {
            if (mouseDown) {
                setIsRotating(false)
                setMouseDown(false)
                setCenterCoords(INITIAL_CENTER_COORDS)
            }
        }

        const providerRefCurrent = providerRef.current

        providerRefCurrent.addEventListener('mouseup', listenerCallback)

        return () => providerRefCurrent.removeEventListener('mouseup', listenerCallback)
    }, [mouseDown, providerRef, setIsRotating])

    useEffect(() => {
        const listenerCallback = event => {
            if (mouseDown) {
                const { pageX, pageY } = event

                const pageDeltaX = pageX - centerCoords.pageX
                const pageDeltaY = centerCoords.pageY - pageY

                const vectorAngle = utils.getOffsetAngle(
                    pageDeltaX,
                    pageDeltaY,
                    Math.atan(pageDeltaY / pageDeltaX) * (180 / Math.PI)
                )

                setRotation(vectorAngle)
            }
        }

        const providerRefCurrent = providerRef.current

        providerRefCurrent.addEventListener('mousemove', listenerCallback)

        return () => providerRefCurrent.removeEventListener('mousemove', listenerCallback)
    }, [
        centerCoords.pageX,
        centerCoords.pageY,
        mouseDown,
        providerRef,
        rotation,
        setIsRotating,
        setRotation,
    ])

    return (
        <i
            ref={cursorRef}
            className="fas fa-undo resize-container-rotate"
            style={containerTop < 30 ? { bottom: '-30px' } : { top: '-30px' }}
        />
    )
}
