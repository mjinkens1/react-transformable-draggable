import React, { createContext } from 'react'

export const ApiContext = createContext({})

export const ApiLayer = ({
    boundingBoxStyle,
    boundingBoxStyleMobile,
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
                boundingBoxStyle,
                boundingBoxStyleMobile,
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
    boundingBoxStyle: undefined,
    boundingBoxStyleMobile: undefined,
    hideBoundingBox: false,
    hideHandles: false,
    initialPosition: 'center',
    lockAspectRatio: false,
    // maxWidth: 'none',
    // maxHeight: 'none',
    minWidth: 70,
    minHeight: 70,
    resizeHandleStyle: undefined,
    resizeHandleStyleMobile: undefined,
    rotateHandleStyle: undefined,
    rotateHandleStyleMobile: undefined,
}

export const defaultProps = ApiLayer.defaultProps
