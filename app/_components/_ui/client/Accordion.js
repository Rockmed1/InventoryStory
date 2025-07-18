"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/app/_utils/utils";

/**
 * Accordion component that can be either single or multiple type
 *
 * For single type:
 * - type: 'single'
 * - value?: string - The controlled stateful value of the accordion item whose content is expanded
 * - defaultValue?: string - The value of the item whose content is expanded when initially rendered
 * - onValueChange?(value: string): void - Callback that fires when state changes
 * - collapsible?: boolean - Whether an accordion item can be collapsed after opened (default: false)
 *
 * For multiple type:
 * - type: 'multiple'
 * - value?: string[] - The controlled stateful value of the accordion items whose contents are expanded
 * - defaultValue?: string[] - The value of the items whose contents are expanded when initially rendered
 * - onValueChange?(value: string[]): void - Callback that fires when state changes
 *
 * Common props:
 * - disabled?: boolean - Whether accordion is disabled from user interaction (default: false)
 * - orientation?: 'horizontal' | 'vertical' - The layout orientation (default: 'vertical')
 * - dir?: 'ltr' | 'rtl' - The language read direction
 */
function Accordion({ ...props }) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionHeader({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Header className={className} {...props}>
      {children}
    </AccordionPrimitive.Header>
  );
}

/**
 * AccordionItem contains all of the parts of a collapsible section inside of an Accordion.
 *
 * Props:
 * - disabled?: boolean - Whether accordion item is disabled from user interaction (default: false)
 * - value: string - A unique string value for the accordion item (required)
 * - All other CollapsiblePrimitive.Root props except 'open', 'defaultOpen', 'onOpenChange'
 */
function AccordionItem({ className, ...props }) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

/**
 * AccordionHeader contains the content for the parts of an AccordionItem that will be visible
 * whether or not its content is collapsed.
 *
 * Props: All Primitive.h3 props
 */
function AccordionTrigger({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}>
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * AccordionContent contains the collapsible content for an AccordionItem.
 *
 * Props: All CollapsiblePrimitive.Content props
 */
function AccordionContent({ className, children, ...props }) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}>
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
};
