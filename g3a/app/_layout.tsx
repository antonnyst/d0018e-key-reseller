import { Stack } from "expo-router";
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome'

export default function RootLayout() {
  return (
    <Tabs screenOptions={{tabBarActiveTintColor: 'blue'}}>
      <Tabs.Screen
      name="index"
      options={{
        title: 'Games',
        tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
      }}
      />
    <Tabs.Screen
      name="profile"
      options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <FontAwesome size={28} name='user' color={color} />,
      }}
      />
    </Tabs>
  );
}
