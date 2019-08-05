import React, { useContext, useEffect, useRef } from 'react'
import { useDrop } from 'react-dnd'

// Components/Context
import { DndContext } from '../dndProvider/DndProvider'

export const DeleteTarget = ({ children, onDelete }) => {
    const {
        childTransformables,
        isHoveringDelete,
        setChildTransformables,
        setIsHoveringDelete,
    } = useContext(DndContext)
    const hoverTimeout = useRef()

    const [, drop] = useDrop({
        accept: ['TRANSFORMABLE_DRAGGABLE'],
        collect: monitor => ({ ...monitor.getItem() }),
        drop: ({ id }, monitor) => {
            const { [id]: idToDelete, ...remainingTranformables } = childTransformables

            setChildTransformables(remainingTranformables)

            onDelete && onDelete(id)
        },
        hover: () => {
            if (hoverTimeout.current) {
                clearTimeout(hoverTimeout.current)
            }

            if (!isHoveringDelete) {
                setIsHoveringDelete(true)
            }

            hoverTimeout.current = setTimeout(() => {
                setIsHoveringDelete(false)
            }, 50)
        },
    })

    return <div ref={drop}>{children}</div>
}
