import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { width, height } = Dimensions.get('window')

interface OnboardingSlide {
  icon: string
  title: string
  description: string
  color: string
  gradient: string[]
}

const slides: OnboardingSlide[] = [
  {
    icon: 'heart',
    title: 'Hayvan Dostlarımız İçin',
    description: 'CatPet ile Türkiye genelindeki tüm hayvan dostlarımıza yardım edin. Sahiplendirme, besleme ve bilgilendirme platformumuzda bir araya gelin.',
    color: '#FF7A00',
    gradient: ['#FF7A00', '#FF9500'],
  },
  {
    icon: 'location',
    title: 'Mama Bırakma Noktaları',
    description: 'Harita üzerinden mama ve su kaplarının konumlarını görün, yeni noktalar ekleyerek sokaktaki canları doyurun.',
    color: '#10b981',
    gradient: ['#10b981', '#34d399'],
  },
  {
    icon: 'library',
    title: 'Bilgi Bankası',
    description: 'Hayvan bakımı, sağlığı ve eğitimi hakkında uzmanlar tarafından hazırlanmış makalelere ulaşın.',
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#a78bfa'],
  },
  {
    icon: 'people',
    title: 'Topluluk Platformu',
    description: 'Binlerce hayvanseverle bir araya gelin, deneyimlerinizi paylaşın ve hayvanlar için fark yaratın.',
    color: '#3b82f6',
    gradient: ['#3b82f6', '#60a5fa'],
  },
]

interface OnboardingScreenProps {
  onComplete: () => void
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const insets = useSafeAreaInsets()

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width)
    setCurrentIndex(slideIndex)
  }

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      })
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true')
    onComplete()
  }

  const goToSlide = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    })
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Skip Button */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 20 }]}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Atla</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <View style={styles.slideContent}>
              {/* Icon Container */}
              <View style={[styles.iconContainer, { backgroundColor: `${slide.color}15` }]}>
                <Ionicons name={slide.icon as any} size={80} color={slide.color} />
              </View>

              {/* Title */}
              <Text style={styles.title}>{slide.title}</Text>

              {/* Description */}
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              currentIndex === index && [styles.dotActive, { backgroundColor: slides[index].color }],
            ]}
            onPress={() => goToSlide(index)}
            activeOpacity={0.7}
          />
        ))}
      </View>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {currentIndex > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goToSlide(currentIndex - 1)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.backButtonText}>Geri</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: slides[currentIndex].color }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? 'Başlayalım' : 'İleri'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F0',
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: width - 80,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  description: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '400',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
})

