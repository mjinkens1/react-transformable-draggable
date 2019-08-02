import { RotateHandleMouse } from './RotateHandleMouse'
import { RotateHandleTouch } from './RotateHandleTouch'

export const RotateHandle = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
)
    ? RotateHandleTouch
    : RotateHandleMouse
