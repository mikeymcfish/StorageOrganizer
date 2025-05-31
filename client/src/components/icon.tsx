import { HTMLAttributes } from "react";

interface IconProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: number;
}

// Custom SVG icons mapping
const customIcons: Record<string, string> = {
  "custom-crystal": "/src/assets/icons/crystal.svg",
  // Add more custom icons here as you add SVG files
};

export function Icon({ name, size = 16, className, ...props }: IconProps) {
  // Check if it's a custom SVG icon
  if (name.startsWith("custom-") && customIcons[name]) {
    return (
      <div
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        {...props}
      >
        <img
          src={customIcons[name]}
          alt={name}
          width={size}
          height={size}
          style={{ filter: "brightness(0) saturate(100%)" }}
        />
      </div>
    );
  }

  // Default to FontAwesome icon
  return (
    <i
      className={`fas fa-${name} ${className}`}
      style={{ fontSize: size }}
      {...props}
    />
  );
}
