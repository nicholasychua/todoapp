"use client";

import * as React from "react";

type SideShadedFrameProps = {
  children: React.ReactNode;
  className?: string;
};

export function SideShadedFrame({ children, className }: SideShadedFrameProps) {
  return (
    <div className={`side-shaded-frame ${className ?? ""}`}>{children}</div>
  );
}

export default SideShadedFrame;
