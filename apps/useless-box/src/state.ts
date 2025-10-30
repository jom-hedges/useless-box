export type SwitchState = {
  isSwitchOn: boolean
  lastToggledAt: number
}

let switchState: SwitchState = {
  isSwitchOn: false,
  lastToggledAt: Date.now(),
}

export function toggleSwitch(): SwitchState {
  switchState = {
    ...switchState,
    isSwitchOn: !switchState.isSwitchOn,
    lastToggledAt: Date.now(),
  }
  return switchState
}

export function getState(): SwitchState {
  return switchState
}
