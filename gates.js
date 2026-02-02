// promises and stuff

export const CANCEL = Symbol("CANCEL");

export function createGate() {
  let resolve, reject;
  // one outstanding promise per gate
  let promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const reset = () => {
    promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
  };

  return {
    // Wait for this phase to complete; always returns the same promise
    wait() {
      return promise;
    },

    // Resolve the current wait (advance phase)
    open(value) {
      resolve?.(value);
      reset();
    },

    // Reject the current wait (backtrack/abort this phase)
    cancel(reason = CANCEL) {
      reject?.(reason);
      reset();
    },

    // Optional helpers
    isWaiting() {
      return !!resolve;
    }, // true when a wait is in-flight
  };
}

// export const gates = {
//   [Phase.PLAYER_SELECT]: createGate(),
//   [Phase.PLAYER_ACTION]: createGate(),
//   [Phase.ENEMY_TURN]: createGate(),
// };
