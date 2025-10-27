import { colors } from "@/styles/colors";
import { IconProps as TableIconProps } from "@tabler/icons-react-native";
import type React from "react";
import {
  ActivityIndicatorBase,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";
import type { TextProps } from "react-native-svg";
import { s } from "./styles";

type ButtonProps = TouchableOpacityProps & {
  isLoading?: boolean;
};

function Button({ children, style, isLoading = false, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[s.container]}
      activeOpacity={0.8}
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicatorBase size="small" color={colors.gray[100]} />
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

function Title({ children }: TextProps) {
  return <Text style={s.title}>{children}</Text>;
}

type IconProps = {
  icon: React.ComponentType<TableIconProps>;
};

function Icon({ icon: Icon }: IconProps) {
  return <Icon size={24} color={colors.gray[100]} />;
}

Button.Title = Title;
Button.Icon = Icon;
export { Button };
