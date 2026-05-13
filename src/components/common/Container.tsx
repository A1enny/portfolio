import type { ReactNode } from "react";
import clsx from "clsx";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={clsx("mx-auto w-full max-w-[1280px] px-5 md:px-8", className)}
    >
      {children}
    </div>
  );
}

export default Container;
