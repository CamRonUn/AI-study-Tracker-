import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, SafeAreaView } from 'react-native';
import { colors } from '../theme'; 

export function LoadingSpinner() {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    animation.start();

    return () => animation.stop();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    // Replaced s.safe with a direct background dynamic styling block
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <Animated.Text
          style={{
            fontSize: 64,
            transform: [{ rotate: spin }],
          }}
        >
          📚
        </Animated.Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.muted, letterSpacing: 1.5 }}>
          LOADING...
          Can Take A While...
        </Text>
      </View>
    </SafeAreaView>
  );
}