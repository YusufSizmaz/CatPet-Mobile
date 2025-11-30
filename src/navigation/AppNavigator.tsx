import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAuth } from '../contexts/AuthContext'

// Screens (will be created)
import HomeScreen from '../screens/HomeScreen'
import AnimalsScreen from '../screens/AnimalsScreen'
import AnimalDetailScreen from '../screens/AnimalDetailScreen'
import FoodPointsScreen from '../screens/FoodPointsScreen'
import BlogScreen from '../screens/BlogScreen'
import ProfileScreen from '../screens/ProfileScreen'
import LoginScreen from '../screens/LoginScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Ana Sayfa' }}
      />
      <Tab.Screen 
        name="Animals" 
        component={AnimalsScreen}
        options={{ title: 'Sahiplen' }}
      />
      <Tab.Screen 
        name="FoodPoints" 
        component={FoodPointsScreen}
        options={{ title: 'Mama Bırak' }}
      />
      <Tab.Screen 
        name="Blog" 
        component={BlogScreen}
        options={{ title: 'Bilgi Bankası' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    // Return loading screen
    return null
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AnimalDetail" 
              component={AnimalDetailScreen}
              options={{ title: 'Hayvan Detayı' }}
            />
          </>
        ) : (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

