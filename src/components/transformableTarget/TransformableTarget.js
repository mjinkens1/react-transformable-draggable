import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useDrop } from 'react-dnd'
import _ from 'lodash-uuid'

// Components/Context
import { DragLayer } from '../dragLayer/DragLayer'
import { Transformable } from '../transformable/Transformable'
import { DndContext } from '../dndProvider/DndProvider'

// Utils
import { utils } from '../../utils'

const isMobile = utils.isMobile()

export const TransformableContext = createContext({})

export const TransformableTarget = React.forwardRef(
    ({ children, className, consumerRef, style }, ref) => {
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

                    setCurrentDragSource({
                        dragSourceId: id,
                        pageScroll: { scrollX: 0, scrollY: 0 },
                    })

                    setChildTransformables({
                        ...childTransformables,
                        [id]: { renderItem: children, initialPosition, ...props },
                    })
                } else if (type === 'TRANSFORMABLE_DRAGGABLE') {
                    const {
                        scrollX: initialScrollX,
                        scrollY: initialScrollY,
                    } = currentDragSource.pageScroll

                    const { scrollX, scrollY } = window

                    const deltaScrollX = scrollX - initialScrollX
                    const deltaScrollY = scrollY - initialScrollY

                    const { x, y } = monitor.getDifferenceFromInitialOffset()

                    const update = { x: x + deltaScrollX, y: y + deltaScrollY, id }

                    setDragUpdate(update)
                }
            },
        })

        useEffect(() => {
            // Prevent resize events from bubbling to the out of draggable area and causing scroll while resizing
            const listenerCallback = event => {
                if (event.target.classList.contains('resize-handle--selected')) {
                    event.stopImmediatePropagation()
                    isMobile && event.preventDefault()
                }
            }

            const providerRefCurrent = providerRef.current

            const eventType = isMobile ? 'touchstart' : 'mousedown'

            providerRefCurrent.addEventListener(eventType, listenerCallback)

            return () => providerRefCurrent.removeEventListener(eventType, listenerCallback)
        }, [])

        const { dragSourceId, pageScroll: initialPageScroll } = currentDragSource

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
                        <div className={className} ref={ref} style={style}>
                            {/*/ Drag layer for manually added chldren of component (normal props.children) */}
                            {React.Children.map(children, child => {
                                return (
                                    dragSourceId &&
                                    dragSourceId === child.props.id && (
                                        <DragLayer
                                            id={dragSourceId}
                                            initialPageScroll={initialPageScroll}
                                            providerRef={providerRef}
                                        >
                                            {child}
                                        </DragLayer>
                                    )
                                )
                            })}
                            {/*/ Drag layer for dropped-in chidren of component */}
                            {Object.entries(childTransformables).map(
                                ([id, { renderItem, ...props }]) =>
                                    dragSourceId &&
                                    dragSourceId === id && (
                                        <DragLayer
                                            key={id + 'drag-layer'}
                                            id={dragSourceId}
                                            initialPageScroll={initialPageScroll}
                                            providerRef={providerRef}
                                        >
                                            <Transformable id={id} {...props}>
                                                {renderItem}
                                            </Transformable>
                                        </DragLayer>
                                    )
                            )}
                            {/*/ Dropped-in chidren of component */}
                            {Object.entries(childTransformables).map(
                                ([id, { renderItem, ...props }]) => (
                                    <Transformable key={id} id={id} {...props}>
                                        {renderItem}
                                    </Transformable>
                                )
                            )}
                            {/*/ Manually added chidren of component (props.children) */}
                            {children}
                        </div>
                    </div>
                </div>
            </TransformableContext.Provider>
        )
    }
)
