// Components/Loader.js — RaimfortActionSport (Uiverse ripple grid loader via WebView)
// npm i react-native-webview

import React, { memo, useMemo } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const DEFAULT_BG = '#0B1522';

function buildHtml({ cellSize = 52, cellSpacing = 1 }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: transparent;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .wrap{
      width: 100%;
      height: 100%;
      display:flex;
      align-items:center;
      justify-content:center;
      background: transparent;
    }

    /* From Uiverse.io by alexruix */
    .loader {
      --cell-size: ${cellSize}px;
      --cell-spacing: ${cellSpacing}px;
      --cells: 3;
      --total-size: calc(var(--cells) * (var(--cell-size) + 2 * var(--cell-spacing)));
      display: flex;
      flex-wrap: wrap;
      width: var(--total-size);
      height: var(--total-size);
    }

    .cell {
      flex: 0 0 var(--cell-size);
      margin: var(--cell-spacing);
      background-color: transparent;
      box-sizing: border-box;
      border-radius: 4px;
      animation: 1.5s ripple ease infinite;
    }

    .cell.d-1 { animation-delay: 100ms; }
    .cell.d-2 { animation-delay: 200ms; }
    .cell.d-3 { animation-delay: 300ms; }
    .cell.d-4 { animation-delay: 400ms; }

    .cell:nth-child(1) { --cell-color: #00FF87; }
    .cell:nth-child(2) { --cell-color: #0CFD95; }
    .cell:nth-child(3) { --cell-color: #17FBA2; }
    .cell:nth-child(4) { --cell-color: #23F9B2; }
    .cell:nth-child(5) { --cell-color: #30F7C3; }
    .cell:nth-child(6) { --cell-color: #3DF5D4; }
    .cell:nth-child(7) { --cell-color: #45F4DE; }
    .cell:nth-child(8) { --cell-color: #53F1F0; }
    .cell:nth-child(9) { --cell-color: #60EFFF; }

    @keyframes ripple {
      0% { background-color: transparent; }
      30% { background-color: var(--cell-color); }
      60% { background-color: transparent; }
      100% { background-color: transparent; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="loader">
      <div class="cell d-0"></div>
      <div class="cell d-1"></div>
      <div class="cell d-2"></div>

      <div class="cell d-1"></div>
      <div class="cell d-2"></div>

      <div class="cell d-2"></div>
      <div class="cell d-3"></div>

      <div class="cell d-3"></div>
      <div class="cell d-4"></div>
    </div>
  </div>
</body>
</html>`;
}

function Loader({
  fullscreen = false,
  backgroundColor = DEFAULT_BG,
  cellSize = 52,
  cellSpacing = 1,
}) {
  const html = useMemo(() => buildHtml({ cellSize, cellSpacing }), [cellSize, cellSpacing]);

  return (
    <View style={[styles.wrap, fullscreen && styles.fullscreen, { backgroundColor }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        containerStyle={styles.web}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        javaScriptEnabled
        domStorageEnabled
        automaticallyAdjustContentInsets={false}
        androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  web: {
    backgroundColor: 'transparent',
    width: 220,  // чуть больше чем 3*52 + отступы
    height: 220,
  },
});

export default memo(Loader);
