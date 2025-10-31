import { getState, toggleState } from "./state";

export function startStateWatcher() {
  setInterval(() => {
    const { isSwitchOn } = getState();
    if (isSwitchOn) {
      console.log("[Watcher] Switch is ON - flipping it OFF.");
      toggleState();
    } else {
      console.log("[Watcher] Switch is OFF - standing by.")
    }
  }, 1000);
}
