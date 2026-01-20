import { Platform, ViewStyle } from 'react-native';

/**
 * 创建跨平台阴影样式
 * Web 平台使用 boxShadow，原生平台使用 shadow* 属性
 */
export function createShadowStyle(
  shadowColor: string,
  shadowOffset: { width: number; height: number },
  shadowOpacity: number,
  shadowRadius: number,
  elevation?: number
): ViewStyle {
  if (Platform.OS === 'web') {
    // Web 平台使用 boxShadow
    const { width, height } = shadowOffset;
    const blur = shadowRadius;
    const spread = 0;
    const color = shadowColor.replace(
      /rgba?\(([^)]+)\)/,
      (match, values) => {
        const parts = values.split(',').map((v: string) => v.trim());
        if (parts.length === 4) {
          // rgba
          const opacity = parseFloat(parts[3]) * shadowOpacity;
          return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${opacity})`;
        } else if (parts.length === 3) {
          // rgb
          return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${shadowOpacity})`;
        }
        return match;
      }
    );
    
    return {
      boxShadow: `${width}px ${height}px ${blur}px ${spread}px ${color}`,
    } as ViewStyle;
  }
  
  // 原生平台使用 shadow* 属性
  return {
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    ...(elevation !== undefined && Platform.OS === 'android' ? { elevation } : {}),
  };
}
