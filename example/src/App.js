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

export const App = () => {
    const [deleteClassName, setDeleteClassName] = useState('app-delete-target')
    const [renderItems, setRenderItems] = useState([])

    const onDelete = (id, type) => {
        console.log('deleted type: ', type)
        const updatedRenderItems = renderItems.filter(item => item.id !== id)

        setRenderItems(updatedRenderItems)
    }

    const onHoverEnd = () => {
        setDeleteClassName('app-delete-target')
    }

    const onHoverStart = () => {
        setDeleteClassName('app-delete-target--hover')
    }

    return (
        <div className="app">
            <DndProvider>
                <TransformableTarget className="app-transformable-target">
                    {renderItems.map(({ id, renderItem }) => (
                        <Transformable key={id} id={id} type="CLICK_TO_ADD">
                            {renderItem}
                        </Transformable>
                    ))}
                </TransformableTarget>
                <div className="app-toolbar">
                    <DeleteTarget
                        onDelete={onDelete}
                        onHoverStart={onHoverStart}
                        onHoverEnd={onHoverEnd}
                    >
                        <div className={deleteClassName}>DRAG HERE TO DELETE</div>
                    </DeleteTarget>
                    <div className="app-add-items">
                        <Droppable type="DRAG_TO_ADD">
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
                </div>
            </DndProvider>
        </div>
    )
}
