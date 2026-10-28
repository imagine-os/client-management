import * as React from "react";
import { Modal } from "./Modal";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** left for navigation, right for details and settings. */
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

/** A panel that slides in from the edge and blocks the page: the sidebar and inspector on small screens, settings, thread setup. */
export function Drawer({ side = "right", size = "sm", ...rest }: DrawerProps) {
  return <Modal placement={side} size={size} {...rest} />;
}
