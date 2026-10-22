import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { BACKDROP, useResolvedScheme } from '@/lib/theme';

/**
 * The aurora behind every screen: a base gradient with glowing elliptical ribbons. Glass panels
 * are translucent, so this is what gives them colour and depth. Static vector shapes, so it costs
 * almost nothing to draw.
 */
export function Backdrop() {
  const { gradient, glows } = BACKDROP[useResolvedScheme()];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          {glows.map((g, i) => (
            <RadialGradient key={i} id={`aurora${i}`} cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} fx={g.cx} fy={g.cy}>
              <Stop offset="0" stopColor={g.color} stopOpacity={g.opacity} />
              <Stop offset="0.45" stopColor={g.color} stopOpacity={g.opacity * 0.45} />
              <Stop offset="1" stopColor={g.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {glows.map((_, i) => (
          <Rect key={i} x="0" y="0" width="100%" height="100%" fill={`url(#aurora${i})`} />
        ))}
      </Svg>
    </View>
  );
}

/**
 * Header background: the same aurora, drawn at full-screen size and clipped to the header, so
 * content scrolling underneath disappears behind the title with no visible band or seam.
 */
export function HeaderBackdrop() {
  const { width, height } = useWindowDimensions();
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <View style={{ position: 'absolute', top: 0, left: 0, width, height }}>
        <Backdrop />
      </View>
    </View>
  );
}
