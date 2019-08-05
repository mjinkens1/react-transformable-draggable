import React, { useState } from 'react'
import _ from 'lodash-uuid'
import {
    DeleteTarget,
    DndProvider,
    Droppable,
    Transformable,
    TransformableTarget,
} from 'react-transformable-draggable'

import logo from './logo.svg'
import './App.css'

const renderItem = (
    <div className="app-render-item">
        CLICK ME
        <img src={logo} className="app-logo" alt="logo" />
        TO ADD
    </div>
)

const transformableTargetStyle = {
    position: 'relative',
    width: '85vw',
    height: '70vh',
    backgroundColor: 'cadetblue',
}

export const App = () => {
    const [renderItems, setRenderItems] = useState([])

    const onDelete = id => {
        const updatedRenderItems = renderItems.filter(item => item.id !== id)

        setRenderItems(updatedRenderItems)
    }

    return (
        <div className="app">
            <header className="app-header">
                <DndProvider>
                    <TransformableTarget style={transformableTargetStyle}>
                        {renderItems.map(({ id, renderItem }) => (
                            <Transformable key={id} id={id}>
                                {renderItem}
                            </Transformable>
                        ))}
                    </TransformableTarget>
                    <div className="app-add-items">
                        <DeleteTarget onDelete={onDelete}>
                            <div className="app-delete-target">DRAG HERE TO DELETE</div>
                        </DeleteTarget>
                        <Droppable>
                            <div className="app-render-item">
                                DRAG ME
                                <img src={logo} className="app-logo" alt="logo" />
                                TO ADD
                            </div>
                        </Droppable>
                        <div
                            onClick={() =>
                                setRenderItems([...renderItems, { renderItem, id: _.uuid() }])
                            }
                        >
                            <div className="app-render-item">
                                CLICK ME
                                <img src={logo} className="app-logo" alt="logo" />
                                TO ADD
                            </div>
                        </div>
                    </div>
                </DndProvider>
            </header>
        </div>
    )
}
