import isEqual from 'react-fast-compare'

export const utils = {
    getAngleAdjustedDimensions: (angledWidth, angledHeight, angle) => {
        const angleRad = (() => {
            if (angle <= 90) {
                return (angle * Math.PI) / 180
            } else if (angle > 90 && angle < 180) {
                return ((180 - angle) * Math.PI) / 180
            } else if (angle >= 180 && angle < 270) {
                return (angle * Math.PI) / 180
            } else if (angle >= 270 && angle <= 360) {
                return (-1 * angle * Math.PI) / 180
            }
        })()

        const adjustedWidth = Math.round(
            Math.abs(
                (angledWidth * Math.cos(angleRad) - angledHeight * Math.sin(angleRad)) /
                    (Math.pow(Math.cos(angleRad), 2) - Math.pow(Math.sin(angleRad), 2))
            )
        )

        const adjustedHeight = Math.round(
            Math.abs(
                (angledHeight * Math.cos(angleRad) - angledWidth * Math.sin(angleRad)) /
                    (Math.pow(Math.cos(angleRad), 2) - Math.pow(Math.sin(angleRad), 2))
            )
        )

        const widthDelta = angledWidth - adjustedWidth
        const heightDelta = angledHeight - adjustedHeight

        return { adjustedWidth, adjustedHeight, widthDelta, heightDelta }
    },
    getResizeFunction: position => {
        switch (position) {
            case 'top-left':
                return (offsetX, offsetY, wrapperWidth, wrapperHeight, options) => {
                    // safeOffset needed to prevent container from moving at min size, only needed for top and left.
                    const { aspectRatio, lockAspectRatio, minWidth, minHeight } = options

                    const maxOffsetX = lockAspectRatio
                        ? Math.min(wrapperWidth - minWidth, wrapperHeight * aspectRatio - minWidth)
                        : wrapperWidth - minWidth
                    const maxOffsetY = lockAspectRatio
                        ? Math.min(
                              wrapperHeight - minHeight,
                              wrapperWidth / aspectRatio - minHeight
                          )
                        : wrapperHeight - minHeight
                    const safeOffsetX = Math.min(offsetX, maxOffsetX)
                    const safeOffsetY = Math.min(offsetY, maxOffsetY)

                    return {
                        top: lockAspectRatio ? safeOffsetX / aspectRatio : safeOffsetY,
                        right: 0,
                        bottom: 0,
                        left: safeOffsetX,
                    }
                }

            case 'top-right':
                return (offsetX, offsetY, wrapperWidth, wrapperHeight, options) => {
                    // safeOffset needed to prevent container from moving at min size, only needed for top and left.
                    const { aspectRatio, lockAspectRatio, minHeight } = options

                    const maxOffsetY = wrapperHeight - minHeight
                    const safeOffsetY = Math.min(offsetY, maxOffsetY)

                    return {
                        top: 0 + safeOffsetY,
                        right: lockAspectRatio ? safeOffsetY * aspectRatio : 0 - offsetX,
                        bottom: 0,
                        left: 0,
                    }
                }

            case 'bottom-right':
                return (offsetX, offsetY, wrapperWidth, wrapperHeight, options) => {
                    const { aspectRatio, lockAspectRatio, minHeight } = options

                    return {
                        top: 0,
                        right: 0 - offsetX,
                        bottom: lockAspectRatio ? (0 - offsetX) / aspectRatio : 0 - offsetY,
                        left: 0,
                    }
                }

            case 'bottom-left':
                return (offsetX, offsetY, wrapperWidth, wrapperHeight, options) => {
                    // safeOffset needed to prevent container from moving at min size, only needed for top and left.
                    const { aspectRatio, lockAspectRatio, minHeight, minWidth } = options

                    const maxOffsetX = wrapperWidth - minWidth
                    const safeOffsetX = Math.min(offsetX, maxOffsetX)
                    return {
                        top: 0,
                        right: 0,
                        bottom: lockAspectRatio ? safeOffsetX / aspectRatio : 0 - offsetY,
                        left: 0 + safeOffsetX,
                    }
                }

            case 'top-center':
                return (offsetX, offsetY, wrapperWidth, wrapperHeight, options) => {
                    // safeOffset needed to prevent container from moving at min size, only needed for top and left.
                    const { minHeight } = options

                    const maxOffsetY = height - wrapperHeight
                    const safeOffsetY = Math.min(offsetY, maxOffsetY)

                    return {
                        top: 0 + safeOffsetY,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    }
                }

            case 'bottom-center':
                return (offsetX, offsetY, wrapperWidth, wrapperHeight) => ({
                    top: 0,
                    right: 0,
                    bottom: 0 - offsetY,
                    left: 0,
                })

            case 'right':
                return (offsetX, offsetY, wrapperWidth, wrapperHeight) => ({
                    top: 0,
                    right: 0 - offsetX,
                    bottom: 0,
                    left: 0,
                })

            case 'left':
                return (offsetX, offsetY, wrapperWidth, wrapperHeight, options) => {
                    // safeOffset needed to prevent container from moving at min size, only needed for top and left.
                    const { minWidth } = options

                    const maxOffsetX = wrapperWidth - minWidth
                    const safeOffsetX = Math.min(offsetX, maxOffsetX)

                    return {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0 + safeOffsetX,
                    }
                }

            case 'pinch':
                return (offsetX, offsetY, wrapperWidth, wrapperHeight, options) => {
                    // safeOffset needed to prevent container from moving at min size, only needed for top and left.
                    const { aspectRatio, lockAspectRatio, minHeight, minWidth } = options

                    const maxOffsetX = wrapperWidth - minWidth
                    const safeOffsetX = Math.min(offsetX, maxOffsetX)
                    return {
                        top: safeOffsetX / aspectRatio / 2,
                        right: safeOffsetX / 2,
                        bottom: safeOffsetX / aspectRatio / 2,
                        left: safeOffsetX / 2,
                    }
                }

            default:
                return (offsetX, offsetY, wrapperWidth, wrapperHeight, options) => ({
                    width,
                    height,
                })
        }
    },
    getOffsetAngle: (x, y, angle) => {
        if (x >= 0 && y >= 0) {
            return 90 - angle
        } else if (x >= 0 && y < 0) {
            return 90 + Math.abs(angle)
        } else if (x < 0 && y < 0) {
            return 270 - angle
        } else {
            return 270 + Math.abs(angle)
        }
    },
    getOffsetDragAngle: (x, y, angle, position) => {
        const positionOffset = Math.PI / 2

        if (x === 0 && y === 0) {
            return 0
        } else if (x >= 0 && y >= 0) {
            return angle + Math.PI / 2 - positionOffset
        } else if (x >= 0 && y < 0) {
            return Math.PI / 2 + angle - positionOffset
        } else if ((x < 0 && y >= 0) || (x < 0 && y < 0)) {
            return (3 * Math.PI) / 2 + angle - positionOffset
        }
    },
    getPositionFromString: (positionString, providerRef, childDimensions) => {
        const { width, height } = providerRef.current.getBoundingClientRect()
        const { width: containerWidth, height: containerHeight } = childDimensions

        switch (positionString) {
            case 'top-left':
                return {
                    top: 0,
                    left: 0,
                }

            case 'top-center':
                return {
                    top: 0,
                    left: width / 2 - containerWidth / 2,
                }

            case 'top-right':
                return {
                    top: 0,
                    left: width - containerWidth,
                }

            case 'right':
                return {
                    top: height / 2 - containerHeight / 2,
                    left: width - containerWidth,
                }

            case 'bottom-right':
                return {
                    top: height - containerHeight,
                    left: width - containerWidth,
                }

            case 'bottom-center':
                return {
                    top: height - containerHeight,
                    left: width / 2 - containerWidth / 2,
                }

            case 'bottom-left':
                return {
                    top: height - containerHeight,
                    left: 0,
                }
            case 'left':
                return {
                    top: height / 2 - containerHeight / 2,
                    left: 0,
                }
            case 'center':
                return {
                    top: height / 2 - containerHeight / 2,
                    left: width / 2 - containerWidth / 2,
                }

            default:
                return {
                    top: height / 2 - containerHeight / 2,
                    left: width / 2 - containerWidth / 2,
                }
        }
    },
    isEqual: (a, b) => isEqual(a, b),
    isMobile: () =>
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),

    validateDimensions: dimensions => {
        return Object.values(dimensions).every(value => !isNaN(value))
    },
}
