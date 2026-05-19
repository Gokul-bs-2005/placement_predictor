export function notify(message) {
  window.dispatchEvent(new CustomEvent("notify", { detail: message }));
}
