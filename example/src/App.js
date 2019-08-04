import React, { useState } from '../../node_modules/react'
import _ from 'lodash-uuid'
.import {
    DndProvider,
    Droppable,
    Transformable,
    TransformableTarget,
} from 'react-transformable-draggable'

import logo from './logo.svg'
import './App.css'

const renderItem = {
    renderItem: (
        <div className="app-render-item">
            CLICK ME
            <img src={logo} className="app-logo" alt="logo" />
            TO ADD
        </div>
    ),
}

const transformableTargetStyle = {
    position: 'relative',
    width: '85vw',
    height: '70vh',
    backgroundColor: 'cadetblue',
    overflow: 'hidden',
}

export const App = () => {
    const [renderItems, setRenderItems] = useState([])

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
                        <Droppable>
                            <div className="app-render-item">
                                DRAG ME
                                <img src={logo} className="app-logo" alt="logo" />
                                TO ADD
                            </div>
                        </Droppable>
                        <div
                            onClick={() =>
                                setRenderItems([...renderItems, { ...renderItem, id: _.uuid() }])
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
