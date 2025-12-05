import React, { useState, useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../contexts/AuthContext'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Screens (will be created)
import HomeScreen from '../screens/HomeScreen'
import AnimalsScreen from '../screens/AnimalsScreen'
import AnimalDetailScreen from '../screens/AnimalDetailScreen'
import FoodPointsScreen from '../screens/FoodPointsScreen'
import BlogScreen from '../screens/BlogScreen'
import ProfileScreen from '../screens/ProfileScreen'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import AboutScreen from '../screens/AboutScreen'
import LostAnimalScreen from '../screens/LostAnimalScreen'
import BlogDetailScreen from '../screens/BlogDetailScreen'
import ForumDetailScreen from '../screens/ForumDetailScreen'
import OnboardingScreen from '../screens/OnboardingScreen'
import WelcomeScreen from '../screens/WelcomeScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// Custom Header Component for Register Screen
function RegisterHeader({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.registerHeader, { paddingTop: Math.max(insets.top, 0) }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#FF7A00" />
      </TouchableOpacity>
      <Text style={styles.registerHeaderTitle}>Kayıt Ol</Text>
      <View style={styles.headerSpacer} />
    </View>
  )
}

function MainTabs() {
  const insets = useSafeAreaInsets()
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline'
          } else if (route.name === 'Animals') {
            iconName = focused ? 'heart' : 'heart-outline'
          } else if (route.name === 'FoodPoints') {
            iconName = focused ? 'location' : 'location-outline'
          } else if (route.name === 'Blog') {
            iconName = focused ? 'library' : 'library-outline'
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'
          } else {
            iconName = 'help-outline'
          }

          return <Ionicons name={iconName as any} size={size} color={color} />
        },
        tabBarActiveTintColor: '#FF7A00',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          paddingBottom: Math.max(insets.bottom, 5),
          paddingTop: 5,
          height: 60 + Math.max(insets.bottom - 5, 0),
        },
        headerShown: false,
      })}
    >
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
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null)
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true)
  const [showWelcome, setShowWelcome] = useState<{ isNewUser: boolean; userName?: string } | null>(null)

  useEffect(() => {
    console.log('🎉 showWelcome state changed:', showWelcome)
  }, [showWelcome])

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('onboarding_completed')
      setIsOnboardingCompleted(completed === 'true')
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setIsOnboardingCompleted(false)
    } finally {
      setIsCheckingOnboarding(false)
    }
  }

  const checkWelcomeScreen = async () => {
    try {
      const welcomeData = await AsyncStorage.getItem('showWelcomeScreen')
      console.log('🔍 Checking welcome screen flag:', welcomeData)
      if (welcomeData) {
        const parsed = JSON.parse(welcomeData)
        console.log('✅ Welcome screen flag found, showing welcome:', parsed)
        // Set state immediately
        setShowWelcome(parsed)
        // Remove flag after a small delay to ensure state is set
        setTimeout(async () => {
          await AsyncStorage.removeItem('showWelcomeScreen')
          console.log('🗑️ Welcome screen flag removed')
        }, 500)
      } else {
        console.log('❌ No welcome screen flag found')
        setShowWelcome(null)
      }
    } catch (error) {
      console.error('Error checking welcome screen:', error)
      setShowWelcome(null)
    }
  }

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  useEffect(() => {
    if (user) {
      // Delay to ensure AsyncStorage write is complete (increased delay for reliability)
      const timer = setTimeout(() => {
        checkWelcomeScreen()
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowWelcome(null)
    }
  }, [user])

  const handleOnboardingComplete = () => {
    setIsOnboardingCompleted(true)
  }

  if (loading || isCheckingOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    )
  }

  // Show onboarding if not completed
  if (!isOnboardingCompleted) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={showWelcome ? 'welcome' : 'main'}
        initialRouteName={showWelcome ? 'Welcome' : 'Main'}
        screenOptions={{
          headerBackTitle: 'Geri',
          headerBackTitleVisible: true,
        }}
      >
        {user ? (
          <>
            {showWelcome ? (
              <>
                <Stack.Screen 
                  name="Welcome" 
                  options={{ headerShown: false }}
                >
                  {() => (
                    <WelcomeScreen 
                      isNewUser={showWelcome.isNewUser} 
                      userName={showWelcome.userName}
                      onComplete={() => {
                        console.log('🎉 Welcome screen completed, hiding welcome')
                        setShowWelcome(null)
                      }}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen 
                  name="Main" 
                  component={MainTabs}
                  options={{ headerShown: false }}
                />
              </>
            ) : (
              <Stack.Screen 
                name="Main" 
                component={MainTabs}
                options={{ headerShown: false }}
              />
            )}
            <Stack.Screen 
              name="AnimalDetail" 
              component={AnimalDetailScreen}
              options={{
                title: 'Hayvan Detayı',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerShadowVisible: false,
                headerTintColor: '#FF7A00',
                headerTitleStyle: {
                  fontWeight: '700',
                  color: '#1a1a1a',
                },
              }}
            />
            <Stack.Screen 
              name="About" 
              component={AboutScreen}
              options={{
                title: 'Hakkımızda',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerShadowVisible: false,
                headerTintColor: '#FF7A00',
                headerTitleStyle: {
                  fontWeight: '700',
                  color: '#1a1a1a',
                },
              }}
            />
            <Stack.Screen 
              name="LostAnimal" 
              component={LostAnimalScreen}
              options={{
                title: 'Kayıp İlanı',
                headerBackTitle: 'Bir önceki sayfa',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerShadowVisible: false,
                headerTintColor: '#FF7A00',
                headerTitleStyle: {
                  fontWeight: '700',
                  color: '#1a1a1a',
                },
              }}
            />
            <Stack.Screen 
              name="BlogDetail"
              component={BlogDetailScreen}
              options={{
                title: 'Blog Yazısı',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerShadowVisible: false,
                headerTintColor: '#FF7A00',
                headerTitleStyle: {
                  fontWeight: '700',
                  color: '#1a1a1a',
                },
              }}
            />
            <Stack.Screen 
              name="ForumDetail" 
              component={ForumDetailScreen}
              options={{
                title: 'Forum Konusu',
                headerStyle: {
                  backgroundColor: '#fff',
                },
                headerShadowVisible: false,
                headerTintColor: '#FF7A00',
                headerTitleStyle: {
                  fontWeight: '700',
                  color: '#1a1a1a',
                },
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={({ navigation }) => ({
                headerShown: true,
                header: () => <RegisterHeader navigation={navigation} />,
                headerStyle: {
                  backgroundColor: '#FF7A00',
                },
                headerTintColor: '#fff',
              })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF7F0',
  },
  registerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#FF7A00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  registerHeaderTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSpacer: {
    width: 40,
  },
})

