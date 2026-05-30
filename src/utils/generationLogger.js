export function logGenerationEvent(payload) {
  return fetch("http://localhost:3001/api/log-generation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).catch(() => {
    console.debug("Local generation logging server is not running.");
  });
}
