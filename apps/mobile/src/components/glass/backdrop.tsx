import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { BACKDROP, useResolvedScheme } from '@/lib/theme';

/**
 * The gradient and soft colour glows behind every screen. Glass panels are translucent, so
 * this is what gives them depth. Static vector shapes, so it costs almost nothing to draw.
 */
export function Backdrop() {
  const { gradient, glows } = BACKDROP[useResolvedScheme()];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          {glows.map((g, i) => (
            <RadialGradient key={i} id={`glow${i}`} cx={g.cx} cy={g.cy} r={g.r}>
              <Stop offset="0" stopColor={g.color} stopOpacity={g.opacity} />
              <Stop offset="1" stopColor={g.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {glows.map((_, i) => (
          <Rect key={i} x="0" y="0" width="100%" height="100%" fill={`url(#glow${i})`} />
        ))}
      </Svg>
    </View>
  );
}
