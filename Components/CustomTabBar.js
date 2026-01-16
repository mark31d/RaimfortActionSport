// Components/CustomTabBar.js — RaimfortActionSport (dark navy containers + icons)
// Требует иконки в /assets (см. список ниже)

import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Platform } from 'react-native';

// ---- icons (flat) ----
const ICONS = {
  Home: require('../assets/tab_home.png'),
  Timer: require('../assets/tab_timer.png'),
  History: require('../assets/tab_history.png'),
  Board: require('../assets/tab_board.png'),
  Profile: require('../assets/tab_profile.png'),
};

function CustomTabBar({ state, descriptors, navigation, theme }) {
  const currentRoute = state.routes[state.index]?.name;

  return (
    <View style={[styles.outer, { backgroundColor: theme.bg }]}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.card,
            borderColor: theme.line,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = currentRoute === route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          const iconSource = ICONS[route.name];
          const tintColor = isFocused ? theme.accent : theme.text2;

          // Немного выделяем центральную вкладку (Board)
          const isCenter = route.name === 'Board';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.85}
              style={[styles.item, isCenter && styles.centerItem]}
            >
              <View
                style={[
                  styles.iconWrap,
                  isCenter && styles.centerIconWrap,
                  {
                    backgroundColor: isFocused
                      ? 'rgba(66,232,214,0.14)'
                      : 'rgba(255,255,255,0.06)',
                    borderColor: isFocused ? 'rgba(66,232,214,0.35)' : 'rgba(255,255,255,0.10)',
                  },
                ]}
              >
                {iconSource ? (
                  <Image source={iconSource} style={[styles.icon, { tintColor }]} />
                ) : (
                  <View style={[styles.dot, { backgroundColor: tintColor }]} />
                )}
              </View>

              <Text style={[styles.label, { color: tintColor }]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'ios' ? 18 : 12,
  },
  bar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  centerItem: {
    transform: [{ translateY: -2 }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
});

export default memo(CustomTabBar);
