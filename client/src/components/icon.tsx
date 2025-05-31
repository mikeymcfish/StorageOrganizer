import { HTMLAttributes } from "react";

interface IconProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: number;
}

// Custom SVG icons mapping
const customIcons: Record<string, string> = {
  "custom-crystal": "/src/assets/icons/crystal.svg",
  "custom-capacitor": "/src/assets/icons/capacitor.svg",
  "custom-connector": "/src/assets/icons/connector.svg",
  "custom-diode": "/src/assets/icons/diode.svg",
  "custom-ic": "/src/assets/icons/ic.svg",
  "custom-inductor": "/src/assets/icons/inductor.svg",
  "custom-led": "/src/assets/icons/led.svg",
  "custom-resistor": "/src/assets/icons/resistor.svg",
  "custom-resistor_var": "/src/assets/icons/resistor_var.svg",
  "custom-sensor": "/src/assets/icons/sensor.svg",
  "custom-speaker": "/src/assets/icons/speaker.svg",
  "custom-switch": "/src/assets/icons/switch.svg",
  "custom-transistor": "/src/assets/icons/transistor.svg",
  "custom-other": "/src/assets/icons/other.svg",
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
