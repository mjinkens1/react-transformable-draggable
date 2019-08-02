const getPositionOffset = position => (position === 'left' ? (3 * Math.PI) / 2 : Math.PI / 2)

export const utils = {
    getResizeFunction: position => {
        switch (position) {
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
                    left: 0 - offsetX,
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
    getOffsetDragAngle: (x, y, angle, position) => {
        const positionOffset = getPositionOffset(position)

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
}
