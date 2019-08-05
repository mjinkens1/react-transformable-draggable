import React, { useContext, useEffect, useRef, useState } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import throttle from 'lodash.throttle'

// Components/Context
import { DroppablePreview } from './DroppablePreview'
import { DndContext } from '../dndProvider/DndProvider'

// Utils
import { utils } from '../../utils'

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

export const Droppable = ({ children, className, style, id, ...props }) => {
    const { currentDroppableId, setCurrentDroppableId } = useContext(DndContext)

    const [initialPageCoordinates, setInitialPageCoordinates] = useState({})
    const [containerDimensions, setContainerDimensions] = useState({ top: 0, left: 0 })

    const containerRef = useRef()

    const [, drag, preview] = useDrag({
        item: {
            type: 'DROPPABLE_WRAPPER',
            children,
            ...props,
            containerDimensions,
            containerRef,
            initialPageCoordinates,
            initialDimensions: {},
            resizeDimensions: {},
            wrapperParams: {},
        },
        begin: () => {
            setCurrentDroppableId(id)
        },
        end: () => {
            setCurrentDroppableId(null)
        },
    })

    useEffect(() => {
        preview(getEmptyImage())
    }, [preview])

    useEffect(() => {
        const { top, left, width, height } = containerRef.current.getBoundingClientRect()

        setContainerDimensions({ top, left, width, height })
    }, [])

    useEffect(() => {
        const listenerCallback = event => {
            const { pageX, pageY } = getPageCoordinates(event)

            const { top, left, width, height } = containerRef.current.getBoundingClientRect()

            const centerX = left + width / 2
            const centerY = top + height / 2

            const diffToCenterX = pageX - centerX
            const diffToCenterY = pageY - centerY

            setInitialPageCoordinates({
                pageX: pageX - diffToCenterX,
                pageY: pageY - diffToCenterY,
            })
        }

        const containerRefCurrent = containerRef.current

        containerRefCurrent.addEventListener(
            isMobile ? 'touchstart' : 'mousedown',
            listenerCallback
        )

        return () =>
            containerRefCurrent.removeEventListener(
                isMobile ? 'touchstart' : 'mousedown',
                listenerCallback
            )
    }, [containerDimensions])

    useEffect(() => {
        const listenerCallback = throttle(() => {
            const { top, left, width, height } = containerRef.current.getBoundingClientRect()

            setContainerDimensions({ top, left, width, height })
        }, 50)

        window.addEventListener('resize', listenerCallback)

        return () => window.removeEventListener('resize', listenerCallback)
    }, [])

    return (
        <div ref={containerRef} className={`droppable-container ${className}`} style={style}>
            {currentDroppableId === id && (
                <DroppablePreview containerRef={containerRef}>{children}</DroppablePreview>
            )}
            <div ref={drag}>{children}</div>
        </div>
    )
}
