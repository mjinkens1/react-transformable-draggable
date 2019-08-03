import React from 'react'
import { DndProvider as Provider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import TouchBackend from 'react-dnd-touch-backend'
import { utils } from '../../utils'

const backend = utils.isMobile() ? TouchBackend : HTML5Backend

export const DndProvider = ({ children }) => <Provider backend={backend}>{children}</Provider>
