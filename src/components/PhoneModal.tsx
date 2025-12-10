import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Linking,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Responsive helper functions
const getResponsiveSize = (size: number) => {
  const scale = SCREEN_WIDTH / 375
  return Math.round(size * scale)
}

const getResponsivePadding = (padding: number) => {
  const scale = SCREEN_WIDTH / 375
  return Math.max(8, Math.round(padding * scale))
}

interface PhoneModalProps {
  visible: boolean
  ownerName: string
  phone: string
  onClose: () => void
}

export default function PhoneModal({
  visible,
  ownerName,
  phone,
  onClose,
}: PhoneModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const phoneScale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.7)
      opacityAnim.setValue(0)
      phoneScale.setValue(0)

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
        Animated.spring(phoneScale, {
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

  const handleCall = () => {
    Linking.openURL(`tel:${phone}`)
    onClose()
  }

  const handleMessage = () => {
    Linking.openURL(`sms:${phone}`)
    onClose()
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
            },
          ]}
        >
          {/* Icon Container */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: phoneScale }],
              },
            ]}
          >
            <Ionicons name="call" size={getResponsiveSize(64)} color="#10b981" />
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>İletişim Bilgisi</Text>

          {/* Owner Name */}
          <View style={styles.ownerContainer}>
            <Ionicons name="person-circle" size={getResponsiveSize(24)} color="#FF7A00" />
            <Text style={styles.ownerName} numberOfLines={1}>{ownerName}</Text>
          </View>

          {/* Phone Number */}
          <View style={styles.phoneContainer}>
            <Ionicons name="call-outline" size={getResponsiveSize(28)} color="#10b981" />
            <Text style={styles.phoneNumber} numberOfLines={1}>{phone}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={getResponsiveSize(20)} color="#fff" />
              <Text style={styles.actionButtonText} numberOfLines={1}>Ara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.messageButton]}
              onPress={handleMessage}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble" size={getResponsiveSize(20)} color="#fff" />
              <Text style={styles.actionButtonText} numberOfLines={1}>Mesaj Gönder</Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Kapat</Text>
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
    padding: getResponsivePadding(20),
  },
  container: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: getResponsiveSize(24),
    padding: getResponsivePadding(28),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  iconContainer: {
    width: getResponsiveSize(100),
    height: getResponsiveSize(100),
    borderRadius: getResponsiveSize(50),
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsivePadding(20),
    borderWidth: 3,
    borderColor: '#10b981',
  },
  title: {
    fontSize: getResponsiveSize(24),
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: getResponsivePadding(20),
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsivePadding(8),
    marginBottom: getResponsivePadding(16),
    paddingHorizontal: getResponsivePadding(16),
    paddingVertical: getResponsivePadding(12),
    backgroundColor: '#FFF7F0',
    borderRadius: getResponsiveSize(12),
    width: '100%',
  },
  ownerName: {
    fontSize: getResponsiveSize(18),
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsivePadding(12),
    marginBottom: getResponsivePadding(24),
    paddingHorizontal: getResponsivePadding(20),
    paddingVertical: getResponsivePadding(16),
    backgroundColor: '#f0fdf4',
    borderRadius: getResponsiveSize(16),
    width: '100%',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  phoneNumber: {
    fontSize: getResponsiveSize(22),
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 1,
  },
  actionsContainer: {
    flexDirection: SCREEN_WIDTH < 375 ? 'column' : 'row',
    gap: getResponsivePadding(12),
    width: '100%',
    marginBottom: getResponsivePadding(16),
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsivePadding(16),
    borderRadius: getResponsiveSize(16),
    gap: getResponsivePadding(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minWidth: SCREEN_WIDTH < 375 ? '100%' : undefined,
  },
  callButton: {
    backgroundColor: '#10b981',
  },
  messageButton: {
    backgroundColor: '#3b82f6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeButton: {
    paddingVertical: getResponsivePadding(12),
    paddingHorizontal: getResponsivePadding(24),
    borderRadius: getResponsiveSize(12),
    backgroundColor: '#f3f4f6',
  },
  closeButtonText: {
    color: '#6b7280',
    fontSize: getResponsiveSize(15),
    fontWeight: '600',
  },
})
