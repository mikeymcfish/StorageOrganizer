import { HTMLAttributes } from "react";
import crystalIcon from "../assets/icons/crystal.svg";
import capacitorIcon from "../assets/icons/capacitor.svg";
import connectorIcon from "../assets/icons/connector.svg";
import diodeIcon from "../assets/icons/diode.svg";
import icIcon from "../assets/icons/ic.svg";
import inductorIcon from "../assets/icons/inductor.svg";
import ledIcon from "../assets/icons/led.svg";
import resistorIcon from "../assets/icons/resistor.svg";
import resistorVarIcon from "../assets/icons/resistor_var.svg";
import sensorIcon from "../assets/icons/sensor.svg";
import speakerIcon from "../assets/icons/speaker.svg";
import switchIcon from "../assets/icons/switch.svg";
import transistorIcon from "../assets/icons/transistor.svg";
import otherIcon from "../assets/icons/other.svg";

interface IconProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: number;
}

// Custom SVG icons mapping
const customIcons: Record<string, string> = {
  "custom-crystal": crystalIcon,
  "custom-capacitor": capacitorIcon,
  "custom-connector": connectorIcon,
  "custom-diode": diodeIcon,
  "custom-ic": icIcon,
  "custom-inductor": inductorIcon,
  "custom-led": ledIcon,
  "custom-resistor": resistorIcon,
  "custom-resistor_var": resistorVarIcon,
  "custom-sensor": sensorIcon,
  "custom-speaker": speakerIcon,
  "custom-switch": switchIcon,
  "custom-transistor": transistorIcon,
  "custom-other": otherIcon,
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
          style={{ 
            filter: "brightness(0) saturate(100%) blur(0.5px)", 
            opacity: 0.5 
          }}
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
