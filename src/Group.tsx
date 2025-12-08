import type { ComponentProps, ReactNode } from "react";
import { cn } from "./utils";

export const Group = ({ className, ...props }: ComponentProps<"div">) => <div {...props} className={cn("group", className)} />;
const GroupItem = ({ label, value, className, onClick, ...props }: ComponentProps<"div"> & { label: ReactNode; value: string }) => {
  return (
    <div
      {...props}
      className={cn("group-item", className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.isDefaultPrevented()) return;
        void navigator.clipboard.writeText(value);
      }}
    >
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  );
};
Group.Item = GroupItem;
