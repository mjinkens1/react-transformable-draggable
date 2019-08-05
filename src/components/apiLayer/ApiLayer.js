import React, { createContext } from 'react'

export const ApiContext = createContext({})

export const ApiLayer = ({
    children,
    className,
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
    style,
}) => {
    return (
        <ApiContext.Provider
            value={{
                className,
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
                style,
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
