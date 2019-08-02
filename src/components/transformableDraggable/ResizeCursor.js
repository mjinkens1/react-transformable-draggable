import { ResizeHandleMouse } from './ResizeHandleMouse'
import { ResizeHandleTouch } from './ResizeHandleTouch'

export const ResizeHandle = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
)
    ? ResizeHandleTouch
    : ResizeHandleMouse
