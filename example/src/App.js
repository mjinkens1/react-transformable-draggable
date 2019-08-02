import React, { useRef, useState } from 'react'

import { TransformableDraggable } from './components/transformableDraggable/TransformableDraggable'
import { DropTarget } from './components/dropTarget/DropTarget'

// import  {DropTarget, TransformableDraggable} from 'react-transformable-draggable'

import logo from './logo.svg'
import './App.css'

const App = () => {
    const [dragUpdate, setDragUpdate] = useState(null)

    const providerRef = useRef()

    return (
        <div className="App">
            <header className="App-header">
                <DropTarget ref={providerRef} setDragUpdate={setDragUpdate}>
                    <TransformableDraggable
                        id="sdfsdfas"
                        dragUpdate={dragUpdate}
                        // initialPosition={{ top: 100, left: 100 }}
                        providerRef={providerRef}
                        setDragUpdate={setDragUpdate}
                    >
                        <img src={logo} className="App-logo" alt="logo" />
                    </TransformableDraggable>
                </DropTarget>

                <p>Drag and resize the icon.</p>
            </header>
        </div>
    )
}

export default App
