import React, { createContext, useContext, useRef, useState } from 'react'
import { useDrop } from 'react-dnd'
import _ from 'lodash-uuid'

// Components/Context
import { DragLayer } from '../dragLayer/DragLayer'
import { Transformable } from '../transformable/Transformable'
import { DndContext } from '../dndProvider/DndProvider'

// Styles
import './styles.scss'

export const TransformableContext = createContext({})

export const TransformableTarget = React.forwardRef(({ children, consumerRef, style }, ref) => {
    const { childTransformables, setChildTransformables } = useContext(DndContext)

    const [currentDragSource, setCurrentDragSource] = useState({ dragSourceId: null })
    const [dragUpdate, setDragUpdate] = useState(null)
    const [lastZIndex, setLastZIndex] = useState(0)

    const providerRef = useRef()

    const [, drop] = useDrop({
        accept: ['TRANSFORMABLE_DRAGGABLE', 'DROPPABLE_WRAPPER'],
        collect: monitor => ({ ...monitor.getItem() }),
        drop: (
            {
                children,
                id,
                type,
                containerDimensions,
                containerRef,
                initialPageCoordinates,
                ...props
            },
            monitor
        ) => {
            if (type === 'DROPPABLE_WRAPPER') {
                const id = _.uuid()

                const { top, left } = providerRef.current.getBoundingClientRect()
                const { x, y } = monitor.getDifferenceFromInitialOffset()
                const { pageX, pageY } = initialPageCoordinates

                const dropPageX = pageX + x
                const dropPageY = pageY + y

                const { width, height } = containerDimensions

                const initialPosition = {
                    top: dropPageY - height / 2 - top,
                    left: dropPageX - width / 2 - left,
                }

                setCurrentDragSource({ dragSourceId: id })

                setChildTransformables({
                    ...childTransformables,
                    [id]: { renderItem: children, initialPosition, ...props },
                })
            } else if (type === 'TRANSFORMABLE_DRAGGABLE') {
                const update = { ...monitor.getDifferenceFromInitialOffset(), id }

                setDragUpdate(update)
            }
        },
    })

    const { dragSourceId } = currentDragSource

    return (
        <TransformableContext.Provider
            value={{
                dragUpdate,
                lastZIndex,
                providerRef,
                setCurrentDragSource,
                setDragUpdate,
                setLastZIndex,
            }}
        >
            <div id="transformable-provider-container" ref={providerRef}>
                <div id="drop-container" ref={drop}>
                    <div className="transformable-target" ref={ref} style={style}>
                        {React.Children.map(children, child => {
                            return (
                                dragSourceId &&
                                dragSourceId === child.props.id && (
                                    <DragLayer id={dragSourceId} providerRef={providerRef}>
                                        {child}
                                    </DragLayer>
                                )
                            )
                        })}
                        {Object.entries(childTransformables).map(
                            ([id, { renderItem, ...props }]) =>
                                dragSourceId &&
                                dragSourceId === id && (
                                    <DragLayer
                                        key={id + 'drag-layer'}
                                        id={dragSourceId}
                                        providerRef={providerRef}
                                    >
                                        <Transformable id={id} {...props}>
                                            {renderItem}
                                        </Transformable>
                                    </DragLayer>
                                )
                        )}
                        {Object.entries(childTransformables).map(
                            ([id, { renderItem, ...props }]) => (
                                <Transformable key={id} id={id} {...props}>
                                    {renderItem}
                                </Transformable>
                            )
                        )}
                        {children}
                    </div>
                </div>
            </div>
        </TransformableContext.Provider>
    )
})
