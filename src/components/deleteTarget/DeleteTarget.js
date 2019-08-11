import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import { useDrop } from 'react-dnd'

// Components/Context
import { DndContext } from '../dndProvider/DndProvider'

// Utils
import { utils } from '../../utils'

const isMobile = utils.isMobile()

export const DeleteTarget = memo(
    ({ children, className, onDelete, onHoverEnd, onHoverStart, style }) => {
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

                if (isMobile) {
                    onHoverEnd && onHoverEnd(id, type)
                    setIsHoveringDelete(false)
                }

                setChildTransformables(remainingTranformables)

                onDelete && onDelete(id, type)
            },
            hover: (_, monitor) => {
                if (isMobile) {
                    onHoverStart && onHoverStart(id, type)
                    setIsHoveringDelete(true)
                } else {
                    if (hoverTimeout.current) {
                        clearTimeout(hoverTimeout.current)
                    }

                    if (!isHoveringDelete) {
                        setIsHoveringDelete(true)
                    }

                    hoverTimeout.current = setTimeout(
                        () => {
                            setIsHoveringDelete(false)
                        },
                        isMobile ? 100 : 100
                    )
                }
            },
        })

        useEffect(() => {
            if (isHoveringDelete) {
                onHoverStart && onHoverStart(id, type)
            } else {
                onHoverEnd && onHoverEnd(id, type)
            }
        }, [isHoveringDelete])

        return (
            <div ref={drop} className={`delete-target ${className || ''}`} style={style}>
                {children}
            </div>
        )
    },
    utils.isEqual
)
