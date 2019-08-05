import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import { useDrop } from 'react-dnd'

// Components/Context
import { DndContext } from '../dndProvider/DndProvider'

// Styles
import './styles.scss'

// Utils
import { utils } from '../../utils'

const isMobile = utils.isMobile()

export const DeleteTarget = memo(({ children, onDelete, onHoverEnd, onHoverStart }) => {
    const {
        childTransformables,
        isHoveringDelete,
        setChildTransformables,
        setIsHoveringDelete,
    } = useContext(DndContext)
    const hoverTimeout = useRef()

    const [{ id, type }, drop] = useDrop({
        accept: ['TRANSFORMABLE_DRAGGABLE'],
        collect: monitor => ({ id, type, ...monitor.getItem() }),
        drop: ({ id, type }, monitor) => {
            const { [id]: idToDelete, ...remainingTranformables } = childTransformables

            setChildTransformables(remainingTranformables)

            document.querySelector('body').style.overflowX = 'auto'

            onDelete && onDelete(id, type)
        },
        hover: () => {
            if (hoverTimeout.current) {
                clearTimeout(hoverTimeout.current)
            }

            if (!isHoveringDelete) {
                onHoverStart && onHoverStart(id, type)
                setIsHoveringDelete(true)
            }

            hoverTimeout.current = setTimeout(
                () => {
                    onHoverEnd && onHoverEnd(id, type)
                    setIsHoveringDelete(false)
                },
                isMobile ? 300 : 100
            )
        },
    })

    return (
        <div ref={drop} className="delete-target">
            {children}
        </div>
    )
}, utils.isEqual)
