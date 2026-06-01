type Props = {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

export function PublicInitialsAvatar({ initials, size = "md", className = "" }: Props) {
  const label = initials.trim().slice(0, 3).toUpperCase() || "IF";
  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center rounded-full bg-[#1A9BB0] font-extrabold text-white",
        SIZE[size],
        className,
      ].join(" ")}
      aria-hidden
    >
      {label}
    </span>
  );
}
