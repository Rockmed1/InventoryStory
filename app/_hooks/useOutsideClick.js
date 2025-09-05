import { useEffect, useRef } from "react";

/**
 * Custom hook that detects clicks outside of a specified element.

 * @param {Function} handler - The function to call when a click outside is detected.
 * @param {boolean} [listenCapturing=true] - Whether to listen for the event during the capturing phase.
 * @returns {React.RefObject} A ref object that should be attached to the element to monitor.
 */

//! lesson 369
// export function useOutsideClick(handler, listenCapturing = true) {
//   const ref = useRef();

//   //to implement the close modal window when there is a click outside:
//   useEffect(() => {
//     function handleClick(e) {
//       // If the click is on the root html element or body, it's likely a ghost click
//       // from an unmounted portal component. Ignore it.
//       if (e.target === document.documentElement || e.target === document.body) {
//         return;
//       }

//       // Check if click is inside a popover/portal content
//       const isInsidePopover =
//         e.target.closest("[data-radix-popover-content]") ||
//         e.target.closest('[data-slot="popover-content"]');

//       if (isInsidePopover) {
//         return;
//       }

//       if (ref.current && !ref.current.contains(e.target)) {
//         handler();
//       }
//     }
//     // true here is to make the event listener listen not on the capturing/bubbling phase but while the event is moving down the DOM tree
//     document.addEventListener("click", handleClick, listenCapturing);

//     //this is to remove the event listener once the component unmounts
//     return () =>
//       document.removeEventListener("click", handleClick, listenCapturing);
//   }, [handler, listenCapturing]);

//   return ref;
// }

export function useOutsideClick(handler, listenCapturing = true) {
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) {
      // If the click is on the root html element or body, it's       likely a ghost click

      if (e.target === document.documentElement || e.target === document.body) {
        return;
      }

      // Check if click is inside any portal content (including       Radix UI)

      const isInsidePortal =
        e.target.closest("[data-radix-popover-content]") ||
        e.target.closest('[data-slot="popover-content"]') ||
        e.target.closest("[data-radix-select-content]") ||
        e.target.closest('[data-slot="select-content"]') ||
        e.target.closest("[data-radix-select-viewport]") ||
        e.target.closest('[data-slot="select"]') ||
        // Handle any Radix portal

        e.target.closest("[data-radix-portal]");

      if (isInsidePortal) {
        return;
      }

      // Additional mobile-specific check

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // On mobile, also check if the target is a select-related    element

        const isSelectElement =
          e.target.closest('[role="option"]') ||
          e.target.closest('[role="listbox"]') ||
          e.target.closest('[data-slot="select-item"]');

        if (isSelectElement) {
          return;
        }
      }

      if (ref.current && !ref.current.contains(e.target)) {
        handler();
      }
    }

    // Use both click and touchend events for better mobile suppor

    const eventType = "ontouchstart" in window ? "touchend" : "click";

    document.addEventListener(
      eventType,
      handleClick,

      listenCapturing,
    );

    // Also listen to click as fallback

    if (eventType === "touchend") {
      document.addEventListener(
        "click",
        handleClick,

        listenCapturing,
      );
    }

    return () => {
      document.removeEventListener(
        eventType,
        handleClick,

        listenCapturing,
      );

      if (eventType === "touchend") {
        document.removeEventListener(
          "click",
          handleClick,

          listenCapturing,
        );
      }
    };
  }, [handler, listenCapturing]);

  return ref;
}
