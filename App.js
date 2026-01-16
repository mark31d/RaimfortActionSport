// App.js — TempoFit (flat imports from /Components + Loader + CustomTabBar)

import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ---- from /Components (flat only) ----
import Loader from './Components/Loader';
import CustomTabBar from './Components/CustomTabBar';

// Screens (flat)
import HomeScreen from './Components/HomeScreen';
import PlanDetailsScreen from './Components/PlanDetailsScreen';
import SessionScreen from './Components/SessionScreen';

import TimerScreen from './Components/TimerScreen';
import IntervalBuilderScreen from './Components/IntervalBuilderScreen';

import HistoryScreen from './Components/HistoryScreen';
import WorkoutDetailsScreen from './Components/WorkoutDetailsScreen';

import BoardScreen from './Components/BoardScreen';
import ChallengeDetailsScreen from './Components/ChallengeDetailsScreen';

import ProfileScreen from './Components/ProfileScreen';
import SettingsScreen from './Components/SettingsScreen';

// ---- nav instances ----
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const HomeStack = createNativeStackNavigator();
const TimerStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const BoardStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// ---- inline theme ----
const THEME = {
  bg: '#0B1522',      // deep navy
  card: '#0F1F33',    // cards / containers
  deep: '#132A41',    // inner blocks
  text: '#FFFFFF',
  text2: '#A9B7C6',
  line: '#1B334A',
  accent: '#42E8D6',  // teal accent (TempoFit vibe)
  accent2: '#FF4D7D', // optional second accent
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: THEME.bg,
    card: THEME.bg,
    text: THEME.text,
    border: THEME.line,
  },
};

// ---- stacks ----
function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="PlanDetails" component={PlanDetailsScreen} />
      <HomeStack.Screen name="Session" component={SessionScreen} />
    </HomeStack.Navigator>
  );
}

function TimerStackNav() {
  return (
    <TimerStack.Navigator screenOptions={{ headerShown: false }}>
      <TimerStack.Screen name="TimerMain" component={TimerScreen} />
      <TimerStack.Screen name="IntervalBuilder" component={IntervalBuilderScreen} />
    </TimerStack.Navigator>
  );
}

function HistoryStackNav() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="HistoryMain" component={HistoryScreen} />
      <HistoryStack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} />
    </HistoryStack.Navigator>
  );
}

function BoardStackNav() {
  return (
    <BoardStack.Navigator screenOptions={{ headerShown: false }}>
      <BoardStack.Screen name="BoardMain" component={BoardScreen} />
      <BoardStack.Screen name="ChallengeDetails" component={ChallengeDetailsScreen} />
      <BoardStack.Screen name="PlanDetails" component={PlanDetailsScreen} />
    </BoardStack.Navigator>
  );
}

function ProfileStackNav() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

// ---- tabs ----
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} theme={THEME} />}
    >
      <Tab.Screen name="Home"    component={HomeStackNav}    options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Timer"   component={TimerStackNav}   options={{ tabBarLabel: 'Timer' }} />
      <Tab.Screen name="History" component={HistoryStackNav} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="Board"   component={BoardStackNav}   options={{ tabBarLabel: 'Board' }} />
      <Tab.Screen name="Profile" component={ProfileStackNav} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ---- root ----
export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1600); // имитация инициализации
    return () => clearTimeout(t);
  }, []);

  if (booting) return <Loader fullscreen color={THEME.accent} />;

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs" component={Tabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export { THEME };
