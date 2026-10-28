import * as React from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /** A question that names the thing: "Remove Maya Chen from the gallery?" */
  title: string;
  /** What happens, and whether it can be undone. */
  description: React.ReactNode;
  /** The action, as a verb: "Remove profile". Never "OK" or "Yes". */
  confirmLabel: string;
  cancelLabel?: string;
  /** danger for anything that deletes or removes access. */
  tone?: "danger" | "default";
  busy?: boolean;
}

/** Asks before something destructive or hard to undo. If the action can be undone, skip this and offer Undo in a Toast instead. */
export function ConfirmDialog({ open, onCancel, onConfirm, title, description, confirmLabel, cancelLabel = "Cancel", tone = "danger", busy }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      title={title}
      description={description}
      footer={<>
        <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant={tone === "danger" ? "danger" : "strong"} loading={busy} onClick={onConfirm}>{confirmLabel}</Button>
      </>}
    />
  );
}
