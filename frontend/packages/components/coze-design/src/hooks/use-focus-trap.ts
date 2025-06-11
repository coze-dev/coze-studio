import { useCallback, useEffect, useRef } from 'react';

export function useFocusTrap(
  active = true,
): (element: HTMLElement | null) => void {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && ref.current) {
        event.preventDefault();

        const focusableElements: HTMLElement[] = Array.from(
          ref.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        );

        if (!focusableElements.length) {
          return;
        }

        const activeElementIndex = focusableElements.indexOf(
          document.activeElement as HTMLElement,
        );

        const getNextFocusableElement = (
          currentIndex: number,
          shiftKey: boolean,
        ) => {
          const nextIndex = shiftKey ? currentIndex - 1 : currentIndex + 1;

          if (nextIndex < 0 || nextIndex >= focusableElements.length) {
            return shiftKey
              ? focusableElements[focusableElements.length - 1]
              : focusableElements[0];
          }

          return focusableElements[nextIndex];
        };

        getNextFocusableElement(activeElementIndex, event.shiftKey)?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [active]);

  return useCallback(
    (element: HTMLElement | null) => {
      if (!active) {
        return undefined;
      }

      if (!ref.current) {
        ref.current = element;
      }

      if (ref.current) {
        ref.current.focus();
      }

      return ref;
    },
    [active],
  );
}
