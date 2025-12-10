import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

interface SuccessDialogProps {
  visible: boolean
  title: string
  message: string
  onClose: () => void
  icon?: string
  type?: 'success' | 'error' | 'info'
}

export default function SuccessDialog({
  visible,
  title,
  message,
  onClose,
  icon,
  type = 'success',
}: SuccessDialogProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const checkmarkScale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.7)
      opacityAnim.setValue(0)
      checkmarkScale.setValue(0)

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      Animated.sequence([
        Animated.delay(200),
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  const getIconName = () => {
    if (icon) return icon
    switch (type) {
      case 'success':
        return 'checkmark-circle'
      case 'error':
        return 'close-circle'
      case 'info':
        return 'information-circle'
      default:
        return 'checkmark-circle'
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#10b981'
      case 'error':
        return '#ef4444'
      case 'info':
        return '#3b82f6'
      default:
        return '#10b981'
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#f0fdf4'
      case 'error':
        return '#fef2f2'
      case 'info':
        return '#eff6ff'
      default:
        return '#f0fdf4'
    }
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: getBackgroundColor(),
            },
          ]}
        >
          {/* Icon Container */}
          <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}15` }]}>
            <Animated.View
              style={{
                transform: [{ scale: checkmarkScale }],
              }}
            >
              <Ionicons name={getIconName() as any} size={64} color={getIconColor()} />
            </Animated.View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Decorative elements */}
          <View style={styles.decorativeContainer}>
            <Ionicons name="paw" size={16} color="#FF7A00" style={styles.decorativePaw1} />
            <Ionicons name="paw" size={12} color="#FF7A00" style={styles.decorativePaw2} />
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: getIconColor() }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Tamam</Text>
            <Ionicons name="checkmark" size={18} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  decorativeContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  decorativePaw1: {
    opacity: 0.3,
  },
  decorativePaw2: {
    position: 'absolute',
    top: 8,
    right: 8,
    opacity: 0.2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})

