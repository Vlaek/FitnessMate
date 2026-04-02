import { useEffect, useState } from 'react';

export function useExceedsScrollHeight(element: HTMLElement | null, threshold: number) {
  const [exceedsThreshold, setExceedsThreshold] = useState(false);

  useEffect(() => {
    if (!element) {
      setExceedsThreshold(false);
      return;
    }

    const updateExceededState = () => {
      setExceedsThreshold(element.scrollHeight > threshold);
    };

    updateExceededState();

    const resizeObserver = new ResizeObserver(updateExceededState);
    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(updateExceededState);
    });

    resizeObserver.observe(element);
    mutationObserver.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [element, threshold]);

  return exceedsThreshold;
}
