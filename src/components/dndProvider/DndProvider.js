import React, { createContext, useRef, useState } from 'react'
import { DndProvider as Provider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import TouchBackend from 'react-dnd-touch-backend'

// Styles
import './styles.scss'

// Utils
import { utils } from '../../utils'

export const DndContext = createContext({})

const backend = utils.isMobile() ? TouchBackend : HTML5Backend

export const DndProvider = ({ children }) => {
    const [childTransformables, setChildTransformables] = useState({})
    const [currentDroppableId, setCurrentDroppableId] = useState(null)
    const [isHoveringDelete, setIsHoveringDelete] = useState(false)

    const droppablePreviewRef = useRef()

    const dragLayerNodeStyle = { opacity: isHoveringDelete ? 0.5 : 1 }

    return (
        <Provider backend={backend} options={{ delayTouchStart: 10 }}>
            <DndContext.Provider
                value={{
                    childTransformables,
                    currentDroppableId,
                    droppablePreviewRef,
                    isHoveringDelete,
                    setChildTransformables,
                    setCurrentDroppableId,
                    setIsHoveringDelete,
                }}
            >
                <div
                    className="drag-layer-portal-node"
                    id="react-transformable-draggable-drag-layer-node"
                    style={dragLayerNodeStyle}
                />
                <div
                    ref={droppablePreviewRef}
                    className="drag-layer-portal-node"
                    id="react-transformable-draggable-droppable-preview-node"
                />
                {children}
            </DndContext.Provider>
        </Provider>
    )
}
