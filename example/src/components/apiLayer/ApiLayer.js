import React, { createContext } from 'react'

export const ApiContext = createContext({})

export const ApiLayer = ({
    children,
    hideBoundingBox,
    hideHandles,
    initialPosition,
    lockAspectRatio,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight,
    resizeHandleStyle,
    resizeHandleStyleMobile,
    rotateHandleStyle,
    rotateHandleStyleMobile,
}) => {
    return (
        <ApiContext.Provider
            value={{
                hideBoundingBox,
                hideHandles,
                initialPosition,
                lockAspectRatio,
                maxHeight,
                maxWidth,
                minHeight,
                minWidth,
                resizeHandleStyle,
                resizeHandleStyleMobile,
                rotateHandleStyle,
                rotateHandleStyleMobile,
            }}
        >
            {children}
        </ApiContext.Provider>
    )
}

ApiLayer.defaultProps = {
    hideBoundingBox: false,
    hideHandles: false,
    initialPosition: 'center',
    lockAspectRatio: false,
    maxWidth: 'none',
    maxHeight: 'none',
    minWidth: 70,
    minHeight: 70,
    resizeHandleStyle: undefined,
    resizeHandleStyleMobile: undefined,
    rotateHandleStyle: undefined,
    rotateHandleStyleMobile: undefined,
}
