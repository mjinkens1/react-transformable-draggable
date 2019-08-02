export const utils = {
    getResizeFunction: type => {
        switch (type) {
            case 'top-left':
                return (offsetX, offsetY) => ({
                    top: 0 + offsetY,
                    right: 0,
                    bottom: 0,
                    left: 0 + offsetX,
                })
            case 'top-right':
                return (offsetX, offsetY) => ({
                    top: 0 + offsetY,
                    right: 0 - offsetX,
                    bottom: 0,
                    left: 0,
                })
            case 'bottom-right':
                return (offsetX, offsetY) => ({
                    top: 0,
                    right: 0 - offsetX,
                    bottom: 0 - offsetY,
                    left: 0,
                })
            case 'bottom-left':
                return (offsetX, offsetY) => ({
                    top: 0,
                    right: 0,
                    bottom: 0 - offsetY,
                    left: 0 + offsetX,
                })

            case 'top-center':
                return (offsetX, offsetY) => ({
                    top: 0 + offsetY,
                    right: 0,
                    bottom: 0,
                    left: 0,
                })
            case 'bottom-center':
                return (offsetX, offsetY) => ({
                    top: 0,
                    right: 0,
                    bottom: 0 - offsetY,
                    left: 0,
                })

            case 'right':
                return (offsetX, offsetY) => ({
                    top: 0,
                    right: 0 - offsetX,
                    bottom: 0,
                    left: 0,
                })
            case 'left':
                return (offsetX, offsetY) => ({
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0 + offsetX,
                })

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
}
