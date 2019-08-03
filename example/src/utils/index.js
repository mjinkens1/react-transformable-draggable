export const utils = {
    getAngleAdjustedDimensions: (angledWidth, angledHeight, angle) => {
        const angleRad = (() => {
            if (angle <= 90) {
                return (angle * Math.PI) / 180
            } else if (angle > 90 && angle < 180) {
                return ((180 - angle) * Math.PI) / 180
            } else if (angle >= 180 && angle < 270) {
                // TODO: Figure out why 3rd quadrant width/height are reversed
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
                return (offsetX, offsetY, width, height, containerRef, options) => {
                    // safeOffset needed to prevent container from moving at min size, only needed for top and left.
                    const { minSize } = options
                    const { minWidth, minHeight } = minSize

                    const maxOffsetX = width - minWidth
                    const maxOffsetY =
                        height > width
                            ? Math.min(height - minHeight, height - width / 1.5)
                            : height - minHeight
                    const safeOffsetX = Math.min(offsetX, maxOffsetX)
                    const safeOffsetY = Math.min(offsetY, maxOffsetY)

                    return {
                        top: 0 + safeOffsetY,
                        right: 0,
                        bottom: 0,
                        left: 0 + safeOffsetX,
                    }
                }

            case 'top-right':
                return (offsetX, offsetY, width, height, containerRef, options) => {
                    // safeOffset needed to prevent container from moving at min size, only needed for top and left.
                    const { minSize } = options
                    const { minHeight } = minSize

                    const maxOffsetY =
                        height > width
                            ? Math.min(height - minHeight, height - width / 1.5)
                            : height - minHeight
                    const safeOffsetY = Math.min(offsetY, maxOffsetY)

                    return {
                        top: 0 + safeOffsetY,
                        right: 0 - offsetX,
                        bottom: 0,
                        left: 0,
                    }
                }

            case 'bottom-right':
                return (offsetX, offsetY, width, height, containerRef) => ({
                    top: 0,
                    right: 0 - offsetX,
                    bottom: 0 - offsetY,
                    left: 0,
                })

            case 'bottom-left':
                return (offsetX, offsetY, width, height, containerRef, options) => {
                    // safeOffset needed to prevent container from moving at min size, only needed for top and left.
                    const { minSize } = options
                    const { minWidth } = minSize

                    const maxOffsetX = width - minWidth
                    const safeOffsetX = Math.min(offsetX, maxOffsetX)
                    return {
                        top: 0,
                        right: 0,
                        bottom: 0 - offsetY,
                        left: 0 + safeOffsetX,
                    }
                }

            case 'top-center':
                return (offsetX, offsetY, width, height, containerRef, options) => {
                    // safeOffset needed to prevent container from moving at min size, only needed for top and left.
                    const { minSize } = options
                    const { minHeight } = minSize

                    const maxOffsetY = height - minHeight
                    const safeOffsetY = Math.min(offsetY, maxOffsetY)

                    return {
                        top: 0 + safeOffsetY,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    }
                }

            case 'bottom-center':
                return (offsetX, offsetY, width, height, containerRef) => ({
                    top: 0,
                    right: 0,
                    bottom: 0 - offsetY,
                    left: 0,
                })

            case 'right':
                return (offsetX, offsetY, width, height, containerRef) => ({
                    top: 0,
                    right: 0 - offsetX,
                    bottom: 0,
                    left: 0,
                })

            case 'left':
                return (offsetX, offsetY, width, height, containerRef, options) => {
                    // safeOffset needed to prevent container from moving at min size, only needed for top and left.
                    const { minSize } = options
                    const { minWidth } = minSize

                    const maxOffsetX = width - minWidth
                    const safeOffsetX = Math.min(offsetX, maxOffsetX)

                    return {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0 + safeOffsetX,
                    }
                }

            default:
                return (width, height, movementX, movementY) => ({ width, height })
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
    isMobile: () =>
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
}
