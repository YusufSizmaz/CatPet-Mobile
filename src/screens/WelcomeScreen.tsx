import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'

const { width, height } = Dimensions.get('window')

interface WelcomeScreenProps {
  isNewUser?: boolean
  userName?: string
  onComplete?: () => void
}

export default function WelcomeScreen({ isNewUser: propIsNewUser, userName: propUserName, onComplete }: WelcomeScreenProps) {
  const navigation = useNavigation()
  const route = useRoute()
  const insets = useSafeAreaInsets()
  const { user, backendUser } = useAuth()
  
  // Get params from route if available
  const routeParams = route.params as { isNewUser?: boolean; userName?: string } | undefined
  const isNewUser = propIsNewUser ?? routeParams?.isNewUser ?? false
  const userName = propUserName ?? routeParams?.userName ?? backendUser?.firstName ?? user?.displayName?.split(' ')[0] ?? null

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const heartScale = useRef(new Animated.Value(0)).current
  const confettiAnimations = useRef(
    Array.from({ length: 50 }, () => {
      const startX = Math.random() * width
      return {
        startX, // Store initial X position (not animated)
        translateX: new Animated.Value(0), // Use translateX for animation
        y: new Animated.Value(-50),
        rotation: new Animated.Value(0),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(1),
      }
    })
  ).current

  useEffect(() => {
    // Main content animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()

    // Heart animation
    Animated.sequence([
      Animated.delay(300),
      Animated.spring(heartScale, {
        toValue: 1,
        tension: 30,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start()

    // Confetti animation
    confettiAnimations.forEach((confetti, index) => {
      const delay = index * 20
      const duration = 2000 + Math.random() * 1000
      const endY = height + 100
      const driftX = (Math.random() - 0.5) * 200 // Horizontal drift

      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(confetti.y, {
              toValue: endY,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(confetti.translateX, {
              toValue: driftX,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(confetti.rotation, {
              toValue: Math.random() * 720,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(confetti.scale, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.delay(duration - 400),
              Animated.timing(confetti.opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ]),
      ]).start()
    })

    // Auto navigate after 3 seconds
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete()
      }
      navigation.navigate('Main' as never)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete, navigation])

  const heartRotation = heartScale.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const getConfettiColor = (index: number) => {
    const colors = ['#FF7A00', '#10b981', '#8b5cf6', '#3b82f6', '#ef4444', '#f59e0b']
    return colors[index % colors.length]
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Confetti */}
      {confettiAnimations.map((confetti, index) => {
        const rotation = confetti.rotation.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        })

        return (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor: getConfettiColor(index),
                left: confetti.startX, // Static initial position
                transform: [
                  { translateX: confetti.translateX },
                  { translateY: confetti.y },
                  { rotate: rotation },
                  { scale: confetti.scale },
                ],
                opacity: confetti.opacity,
              },
            ]}
          />
        )
      })}

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Heart Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: heartScale },
                { rotate: heartRotation },
              ],
            },
          ]}
        >
          <Ionicons name="heart" size={120} color="#FF7A00" />
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>
          {isNewUser ? 'Ailemize Hoş Geldiniz! 🎉' : 'Tekrar Hoş Geldiniz! 👋'}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {isNewUser
            ? 'CatPet ailesinin bir parçası olduğunuz için çok mutluyuz!'
            : userName
            ? `Merhaba ${userName}! Bugün hangi patili dostumuza yardım edelim?`
            : 'Bugün hangi patili dostumuza yardım edelim?'}
        </Text>

        {/* Decorative Elements */}
        <View style={styles.decorativeContainer}>
          <Ionicons name="paw" size={30} color="#FF7A00" style={styles.decorativeIcon} />
          <Ionicons name="star" size={35} color="#10b981" style={styles.decorativeIcon} />
          <Ionicons name="heart" size={28} color="#8b5cf6" style={styles.decorativeIcon} />
        </View>
      </Animated.View>

      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => {
          if (onComplete) {
            onComplete()
          }
          navigation.navigate('Main' as never)
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.skipButtonText}>Devam Et</Text>
        <Ionicons name="arrow-forward" size={20} color="#FF7A00" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  decorativeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 20,
    opacity: 0.7,
  },
  decorativeIcon: {
    opacity: 0.8,
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  skipButton: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF7A00',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF7A00',
  },
})

