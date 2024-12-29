"use client";
import { H3 } from "@expo/html-elements";
import { createAccordion } from "@gluestack-ui/accordion";
import { PrimitiveIcon, UIIcon } from "@gluestack-ui/icon";
import type { VariantProps } from "@gluestack-ui/nativewind-utils";
import { tva } from "@gluestack-ui/nativewind-utils/tva";
import {
  useStyleContext,
  withStyleContext,
} from "@gluestack-ui/nativewind-utils/withStyleContext";
import { cssInterop } from "nativewind";
import React from "react";
import { Platform, Pressable, Text, type TextProps, View } from "react-native";

const SCOPE = "ACCORDION";
/** Styles */

const accordionStyle = tva({
  base: "w-full",
  variants: {
    variant: {
      filled: "bg-white shadow-hard-2",
      unfilled: "",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
});

const accordionItemStyle = tva({
  base: "",
  parentVariants: {
    variant: {
      filled: "bg-background-0",
      unfilled: "bg-transparent",
    },
  },
});
const accordionTitleTextStyle = tva({
  base: "text-typography-900 font-bold flex-1 text-left",
  parentVariants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
});
const accordionIconStyle = tva({
  base: "text-typography-900 fill-none",
  parentVariants: {
    size: {
      "2xs": "h-3 w-3",
      xs: "h-3.5 w-3.5",
      sm: "h-4 w-4",
      md: "h-[18px] w-[18px]",
      lg: "h-5 w-5",
      xl: "h-6 w-6",
    },
  },
});
const accordionContentTextStyle = tva({
  base: "text-typography-700 font-normal",
  parentVariants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
});
const accordionHeaderStyle = tva({
  base: "mx-0 my-0",
});
const accordionContentStyle = tva({
  base: "pt-1 pb-3 px-4",
});
const accordionTriggerStyle = tva({
  base: "w-full flex-row justify-between items-center web:outline-none focus:outline-none data-[disabled=true]:opacity-40 data-[disabled=true]:cursor-not-allowed data-[focus-visible=true]:bg-background-50 py-3 px-4",
});

const Root = withStyleContext(View, SCOPE);

const Header = (
  Platform.OS === "web" ? H3 : View
) as React.ComponentType<TextProps>;

/** Creator */
const UIAccordion = createAccordion({
  Root: Root,
  Item: View,
  Header: Header,
  Trigger: Pressable,
  Icon: UIIcon,
  TitleText: Text,
  ContentText: Text,
  Content: View,
});

cssInterop(PrimitiveIcon, {
  className: {
    target: "style",
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: "classNameColor",
      stroke: true,
    },
  },
});

cssInterop(H3, {
  className: {
    target: "style",
  },
});

type IAccordionProps = React.ComponentPropsWithoutRef<typeof UIAccordion> &
  VariantProps<typeof accordionStyle>;

type IAccordionItemProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Item
> &
  VariantProps<typeof accordionItemStyle>;

type IAccordionContentProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Content
> &
  VariantProps<typeof accordionContentStyle>;

type IAccordionContentTextProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.ContentText
> &
  VariantProps<typeof accordionContentTextStyle>;

type IAccordionIconProps = VariantProps<typeof accordionIconStyle> &
  React.ComponentPropsWithoutRef<typeof UIAccordion.Icon> & {
    as?: React.ElementType;
    height?: number;
    width?: number;
  };

type IAccordionHeaderProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Header
> &
  VariantProps<typeof accordionHeaderStyle>;

type IAccordionTriggerProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Trigger
> &
  VariantProps<typeof accordionTriggerStyle>;

type IAccordionTitleTextProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.TitleText
> &
  VariantProps<typeof accordionTitleTextStyle>;

/** Components */

const Accordion = React.forwardRef<
  React.ElementRef<typeof UIAccordion>,
  IAccordionProps
>(({ className, variant = "filled", size = "md", ...props }, ref) => {
  return (
    <UIAccordion
      ref={ref}
      {...props}
      className={accordionStyle({ variant, class: className })}
      context={{ variant, size }}
    />
  );
});

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Item>,
  IAccordionItemProps
>(({ className, ...props }, ref) => {
  const { variant } = useStyleContext(SCOPE);
  return (
    <UIAccordion.Item
      ref={ref}
      {...props}
      className={accordionItemStyle({
        parentVariants: { variant },
        class: className,
      })}
    />
  );
});

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Content>,
  IAccordionContentProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion.Content
      ref={ref}
      {...props}
      className={accordionContentStyle({
        class: className,
      })}
    />
  );
});

const AccordionContentText = React.forwardRef<
  React.ElementRef<typeof UIAccordion.ContentText>,
  IAccordionContentTextProps
>(({ className, ...props }, ref) => {
  const { size } = useStyleContext(SCOPE);
  return (
    <UIAccordion.ContentText
      ref={ref}
      {...props}
      className={accordionContentTextStyle({
        parentVariants: { size },
        class: className,
      })}
    />
  );
});

const AccordionIcon = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Icon>,
  IAccordionIconProps
>(({ size, className, ...props }, ref) => {
  const { size: parentSize } = useStyleContext(SCOPE);

  if (typeof size === "number") {
    return (
      <UIAccordion.Icon
        ref={ref}
        {...props}
        className={accordionIconStyle({ class: className })}
        size={size}
      />
    );
  }
  if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIAccordion.Icon
        ref={ref}
        {...props}
        className={accordionIconStyle({ class: className })}
      />
    );
  }
  return (
    <UIAccordion.Icon
      ref={ref}
      {...props}
      className={accordionIconStyle({
        size,
        class: className,
        parentVariants: { size: parentSize },
      })}
    />
  );
});

const AccordionHeader = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Header>,
  IAccordionHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion.Header
      ref={ref}
      {...props}
      className={accordionHeaderStyle({
        class: className,
      })}
    />
  );
});

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Trigger>,
  IAccordionTriggerProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion.Trigger
      ref={ref}
      {...props}
      className={accordionTriggerStyle({
        class: className,
      })}
    />
  );
});
const AccordionTitleText = React.forwardRef<
  React.ElementRef<typeof UIAccordion.TitleText>,
  IAccordionTitleTextProps
>(({ className, ...props }, ref) => {
  const { size } = useStyleContext(SCOPE);
  return (
    <UIAccordion.TitleText
      ref={ref}
      {...props}
      className={accordionTitleTextStyle({
        parentVariants: { size },
        class: className,
      })}
    />
  );
});

Accordion.displayName = "Accordion";
AccordionItem.displayName = "AccordionItem";
AccordionHeader.displayName = "AccordionHeader";
AccordionTrigger.displayName = "AccordionTrigger";
AccordionTitleText.displayName = "AccordionTitleText";
AccordionContentText.displayName = "AccordionContentText";
AccordionIcon.displayName = "AccordionIcon";
AccordionContent.displayName = "AccordionContent";

export {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionContentText,
  AccordionIcon,
  AccordionContent,
};
