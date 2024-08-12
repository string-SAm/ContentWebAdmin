import { useEffect } from 'react';

// Define a type for the effect function which doesn't return anything
const useClientSideEffect = (effect: () => (() => void) | void, deps: React.DependencyList) => {
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensures this runs only on the client
      return effect();
    }
  }, deps);
};

export const useConfirmOnPageExit = (shouldConfirm: boolean): void => {
  useClientSideEffect(() => {
    const handler = (event: BeforeUnloadEvent): string | void => {
      if (!shouldConfirm) return;

      const message = 'You have unsaved changes! Are you sure you want to leave?';
      event.returnValue = message; // Chrome requires returnValue to be set
      return message; // Some browsers may display this message
    };

    window.addEventListener('beforeunload', handler);

    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [shouldConfirm]);
};
