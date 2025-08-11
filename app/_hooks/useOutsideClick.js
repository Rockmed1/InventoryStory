import { useEffect, useRef } from "react";

/**
 * Custom hook that detects clicks outside of a specified element.

 * @param {Function} handler - The function to call when a click outside is detected.
 * @param {boolean} [listenCapturing=true] - Whether to listen for the event during the capturing phase.
 * @returns {React.RefObject} A ref object that should be attached to the element to monitor.
 */

//! lesson 369
export function useOutsideClick(handler, listenCapturing = true) {
  const ref = useRef();

  //to implement the close modal window when there is a click outside:
  useEffect(() => {
    function handleClick(e) {
      // If the click is on the root html element or body, it's likely a ghost click
      // from an unmounted portal component. Ignore it.
      if (e.target === document.documentElement || e.target === document.body) {
        return;
      }

      // Check if click is inside a popover/portal content
      const isInsidePopover =
        e.target.closest("[data-radix-popover-content]") ||
        e.target.closest('[data-slot="popover-content"]');

      if (isInsidePopover) {
        return;
      }

      if (ref.current && !ref.current.contains(e.target)) {
        handler();
      }
    }
    // true here is to make the event listener listen not on the capturing/bubbling phase but while the event is moving down the DOM tree
    document.addEventListener("click", handleClick, listenCapturing);

    //this is to remove the event listener once the component unmounts
    return () =>
      document.removeEventListener("click", handleClick, listenCapturing);
  }, [handler, listenCapturing]);

  return ref;
}
