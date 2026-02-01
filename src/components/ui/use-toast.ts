"use client";

import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastState = {
  toasts: ToasterToast[];
};

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: ToastAction) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

function reducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === action.toast.id ? { ...toast, ...action.toast } : toast
        )
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((toast) =>
            toast.id === toastId ? { ...toast, open: false } : toast
          )
        };
      }
      return {
        ...state,
        toasts: state.toasts.map((toast) => ({ ...toast, open: false }))
      };
    }
    case "REMOVE_TOAST": {
      const { toastId } = action;
      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.filter((toast) => toast.id !== toastId)
        };
      }
      return {
        ...state,
        toasts: []
      };
    }
    default:
      return state;
  }
}

let toastId = 0;

function genId() {
  toastId = (toastId + 1) % Number.MAX_SAFE_INTEGER;
  return toastId.toString();
}

function toast({ ...props }: Omit<ToasterToast, "id">) {
  const id = genId();

  const update = (updateProps: Partial<ToasterToast>) =>
    dispatch({ type: "UPDATE_TOAST", toast: { ...updateProps, id } });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });

  return { id, dismiss, update };
}

function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const dismiss = (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId });

  React.useEffect(() => {
    if (state.toasts.length === 0) return;

    const timeouts = state.toasts.map((toastItem) => {
      return setTimeout(() => {
        dispatch({ type: "REMOVE_TOAST", toastId: toastItem.id });
      }, TOAST_REMOVE_DELAY);
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [state.toasts]);

  return { ...state, toast, dismiss };
}

export { useToast, toast };
