"use client";

import { Component, type ReactNode } from "react";

/**
 * ErrorBoundary3D — wraps WebGL islands. On failure (no WebGL, driver crash)
 * the poster fallback renders instead; the page never breaks.
 */
export class ErrorBoundary3D extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err: unknown) {
    if (process.env.NODE_ENV !== "production") console.warn("[3D island failed]", err);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
