// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Procedure = (...args: any[]) => void;

export interface Options {
  isImmediate: boolean;
}

export function debounce<F extends Procedure>(
  func: F,
  waitMilliseconds = 50,
  options: Options = {
    isImmediate: false,
  },
): F {
  let timeoutId: NodeJS.Timeout | undefined;

  return function(this: typeof debounce, ...args: [F, number, Options]) {
    const context = this;

    const doLater = (): void => {
      timeoutId = undefined;
      if (!options.isImmediate) {
        func.apply(context, args);
      }
    };

    const shouldCallNow = options.isImmediate && timeoutId === undefined;

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(doLater, waitMilliseconds);

    if (shouldCallNow) {
      func.apply(context, args);
    }
  } as F;
}
