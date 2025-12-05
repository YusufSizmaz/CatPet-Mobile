import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Responsive helper functions
const getResponsiveSize = (size: number) => {
  const scale = SCREEN_WIDTH / 375 // Base width (iPhone X)
  return Math.round(size * scale)
}

const getResponsivePadding = (padding: number) => {
  const scale = SCREEN_WIDTH / 375
  return Math.max(12, Math.round(padding * scale))
}

export default function HomeScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const isLoggedIn = !!user
  const [dimensions, setDimensions] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT })

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height })
    })
    return () => subscription?.remove()
  }, [])

  const stats = [
    { icon: 'heart', value: '500+', label: 'Sahiplendirilen Dost', color: '#FF7A00' },
    { icon: 'location', value: '200+', label: 'Aktif Mama Noktası', color: '#10b981' },
    { icon: 'people', value: '1000+', label: 'Aktif Üye', color: '#3b82f6' },
    { icon: 'book', value: '50+', label: 'Bilgi Yazısı', color: '#8b5cf6' },
  ]

  const actions = [
    {
      title: 'Sahiplen',
      description: 'Yeni bir dost arıyorsanız',
      icon: 'heart',
      link: 'Animals',
      color: '#FF7A00',
      gradient: ['#FF7A00', '#FF9500'],
    },
    {
      title: 'Mama Bırak',
      description: 'Sokak hayvanlarına yardım edin',
      icon: 'location',
      link: 'FoodPoints',
      color: '#10b981',
      gradient: ['#10b981', '#34d399'],
    },
    {
      title: 'Kayıp İlanı',
      description: 'Kayıp hayvanınızı bulun',
      icon: 'search',
      link: 'LostAnimal',
      color: '#3b82f6',
      gradient: ['#3b82f6', '#60a5fa'],
    },
    {
      title: 'Bilgi Bankası',
      description: 'Uzman bilgilerine ulaşın',
      icon: 'library',
      link: 'Blog',
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#a78bfa'],
    },
  ]

  const features = [
    {
      icon: 'heart-circle',
      title: 'Sahiplenme İlanları',
      description: 'Farklı cins ve yaşlardan yüzlerce dostumuz yeni yuvasını arıyor. Profilinizi oluşturun, hayatınızın dostuyla tanışın.',
      link: 'Animals',
      linkText: 'İlanları Görüntüle',
      color: '#FF7A00',
    },
    {
      icon: 'map',
      title: 'Mama Bırakma Noktaları',
      description: 'Harita üzerinden mama ve su kaplarının konumlarını görün, yeni noktalar ekleyerek sokaktaki canları doyurun.',
      link: 'FoodPoints',
      linkText: 'Haritayı Aç',
      color: '#10b981',
    },
    {
      icon: 'library',
      title: 'Bilgilendirme Merkezi',
      description: 'Hayvan bakımı, sağlığı, eğitimi ve acil durum müdahaleleri hakkında uzmanlar tarafından hazırlanmış makalelere ulaşın.',
      link: 'Blog',
      linkText: 'Makaleleri Oku',
      color: '#8b5cf6',
    },
  ]

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 0 }}
    >
      <View style={styles.content}>
        {/* Hero Section with Gradient Background */}
        <View style={[styles.heroSection, { paddingTop: Math.max(insets.top, 0) }]}>
          <View style={[styles.heroBackground, { 
            top: -Math.max(insets.top, 0),
            paddingTop: Math.max(insets.top, 0),
          }]}>
            <View style={styles.heroGradientCircle1} />
            <View style={styles.heroGradientCircle2} />
            <View style={styles.heroGradientCircle3} />
          </View>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={getResponsiveSize(16)} color="#FF7A00" />
              <Text style={styles.heroBadgeText} numberOfLines={1}>Tüm Hayvan Dostlarımız İçin</Text>
            </View>
            <Text style={styles.title}>
              Hayvan Dostlarımız İçin{'\n'}Birlikte Güçlüyüz
            </Text>
            <Text style={styles.description}>
              CatPet, tamamen ücretsiz bir sosyal sorumluluk projesidir. Kayıp hayvan bulma, sahiplendirme, blog, forum ve mama noktaları gibi tüm özellikleri tek bir platformda sunuyoruz. Hayvan dostlarımız için birlikte daha güçlüyüz. Siz de bize katılın ve bu güzel projeye destek olun!
            </Text>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.heroButton}
                onPress={() => navigation.navigate('Animals' as never)}
                activeOpacity={0.8}
              >
                <Ionicons name="compass" size={getResponsiveSize(22)} color="#fff" />
                <Text style={styles.heroButtonText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
                  Keşfetmeye Başla
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.heroButton, styles.heroButtonOutline]}
                onPress={() => navigation.navigate('About' as never)}
                activeOpacity={0.8}
              >
                <Ionicons name="information-circle" size={getResponsiveSize(22)} color="#FF7A00" />
                <Text style={[styles.heroButtonText, styles.heroButtonTextOutline]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
                  Hakkımızda
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroFeatures}>
              <View style={styles.heroFeature}>
                <Ionicons name="checkmark-circle" size={getResponsiveSize(24)} color="#10b981" />
                <Text style={styles.heroFeatureText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
                  Tamamen Ücretsiz
                </Text>
              </View>
              <View style={styles.heroFeature}>
                <Ionicons name="checkmark-circle" size={getResponsiveSize(24)} color="#10b981" />
                <Text style={styles.heroFeatureText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
                  Kolay Kullanım
                </Text>
              </View>
              <View style={styles.heroFeature}>
                <Ionicons name="checkmark-circle" size={getResponsiveSize(24)} color="#10b981" />
                <Text style={styles.heroFeatureText} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
                  Güvenli Platform
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle} numberOfLines={1}>Topluluğumuzun Gücü</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                  <Ionicons name={stat.icon as any} size={getResponsiveSize(20)} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: stat.color }]} numberOfLines={1}>{stat.value}</Text>
                <Text style={styles.statLabel} numberOfLines={2}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderTop}>
              <Ionicons name="flash" size={20} color="#FF7A00" />
              <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Ne yapmak istiyorsunuz? Size en uygun seçeneği seçin.
            </Text>
          </View>
          <View style={styles.quickActions}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={action.title}
                style={[styles.quickActionCard, { borderLeftColor: action.color }]}
                onPress={() => navigation.navigate(action.link as never)}
                activeOpacity={0.7}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon as any} size={32} color={action.color} />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionDescription}>{action.description}</Text>
                </View>
                <View style={styles.quickActionArrow}>
                  <Ionicons name="chevron-forward" size={getResponsiveSize(20)} color={action.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {!isLoggedIn && (
            <View style={styles.registerPrompt}>
              <Ionicons name="star" size={getResponsiveSize(20)} color="#FF7A00" />
              <Text style={styles.registerPromptText} numberOfLines={2}>
                <Text style={styles.registerPromptBold}>Daha fazla özellik için:</Text>{' '}
                Ücretsiz hesap oluşturun
              </Text>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.featuresBadge}>
              <Ionicons name="sparkles" size={getResponsiveSize(16)} color="#FF7A00" />
              <Text style={styles.featuresBadgeText}>Özelliklerimiz</Text>
            </View>
            <Text style={styles.sectionTitle}>Platformumuzun Sundukları</Text>
            <Text style={styles.sectionSubtitle}>
              Hayvanseverler için tasarlanmış modüler özelliklerimizle, dostlarımıza yardım etmek artık daha kolay ve etkili.
            </Text>
          </View>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={feature.title}
                style={styles.featureCard}
                onPress={() => navigation.navigate(feature.link as never)}
                activeOpacity={0.8}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}15` }]}>
                  <Ionicons name={feature.icon as any} size={getResponsiveSize(36)} color={feature.color} />
                </View>
                <Text style={styles.featureTitle} numberOfLines={2}>{feature.title}</Text>
                <Text style={styles.featureDescription} numberOfLines={4}>{feature.description}</Text>
                <View style={styles.featureLink}>
                  <Text style={[styles.featureLinkText, { color: feature.color }]} numberOfLines={1}>{feature.linkText}</Text>
                  <Ionicons name="arrow-forward-circle" size={getResponsiveSize(20)} color={feature.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA */}
        {!isLoggedIn && (
          <View style={styles.ctaSection}>
            <View style={styles.ctaIconContainer}>
              <Ionicons name="rocket" size={40} color="#FF7A00" />
            </View>
            <Text style={styles.ctaTitle}>Hemen Başlayın</Text>
            <Text style={styles.ctaText}>
              CatPet'e katılın ve hayvanlar için fark yaratın
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Login' as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Giriş Yap / Kayıt Ol</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F0',
  },
  content: {
    paddingBottom: 20,
  },
  heroSection: {
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    marginTop: 0,
  },
  heroBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF7F0',
  },
  heroGradientCircle1: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
  },
  heroGradientCircle2: {
    position: 'absolute',
    top: 30,
    left: -70,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
  },
  heroGradientCircle3: {
    position: 'absolute',
    bottom: -50,
    right: 30,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 122, 0, 0.07)',
  },
  heroContent: {
    paddingHorizontal: getResponsivePadding(24),
    paddingVertical: getResponsivePadding(24),
    alignItems: 'center',
    paddingTop: getResponsivePadding(32),
    paddingBottom: getResponsivePadding(40),
    position: 'relative',
    zIndex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: getResponsivePadding(20),
    paddingVertical: getResponsivePadding(10),
    borderRadius: 28,
    marginBottom: getResponsivePadding(24),
    gap: 8,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#FFE5CC',
    maxWidth: '95%',
  },
  heroBadgeText: {
    fontSize: getResponsiveSize(14),
    fontWeight: '700',
    color: '#FF7A00',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  title: {
    fontSize: getResponsiveSize(36),
    fontWeight: '800',
    marginBottom: getResponsivePadding(20),
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: getResponsiveSize(44),
    letterSpacing: -0.5,
    paddingHorizontal: getResponsivePadding(8),
  },
  description: {
    fontSize: getResponsiveSize(17),
    color: '#374151',
    lineHeight: getResponsiveSize(26),
    textAlign: 'center',
    marginBottom: getResponsivePadding(36),
    paddingHorizontal: getResponsivePadding(16),
    fontWeight: '500',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsivePadding(12),
    marginBottom: getResponsivePadding(24),
    width: '100%',
    justifyContent: 'center',
  },
  heroButton: {
    flex: SCREEN_WIDTH < 375 ? 1 : undefined,
    minWidth: SCREEN_WIDTH < 375 ? '100%' : Math.max(160, (SCREEN_WIDTH - getResponsivePadding(60)) / 2),
    maxWidth: SCREEN_WIDTH < 375 ? '100%' : (SCREEN_WIDTH - getResponsivePadding(60)) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FF7A00',
    paddingVertical: getResponsivePadding(16),
    paddingHorizontal: getResponsivePadding(14),
    borderRadius: 20,
    gap: getResponsivePadding(8),
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  heroButtonOutline: {
    backgroundColor: '#fff',
    borderWidth: 2.5,
    borderColor: '#FF7A00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  heroButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(15),
    fontWeight: '700',
    letterSpacing: 0.2,
    flex: 1,
  },
  heroButtonTextOutline: {
    color: '#FF7A00',
  },
  heroFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: getResponsivePadding(12),
    width: '100%',
    paddingHorizontal: getResponsivePadding(4),
  },
  heroFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: getResponsivePadding(8),
    backgroundColor: '#fff',
    paddingHorizontal: getResponsivePadding(14),
    paddingVertical: getResponsivePadding(14),
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    width: SCREEN_WIDTH < 375 ? '100%' : (SCREEN_WIDTH - getResponsivePadding(60)) / 2 - getResponsivePadding(6),
    minWidth: SCREEN_WIDTH < 375 ? '100%' : Math.max(150, (SCREEN_WIDTH - getResponsivePadding(60)) / 2 - getResponsivePadding(6)),
  },
  heroFeatureIcon: {
    // Icon wrapper
  },
  heroFeatureText: {
    fontSize: getResponsiveSize(15),
    color: '#1a1a1a',
    fontWeight: '700',
    flex: 1,
    flexWrap: 'wrap',
  },
  statsSection: {
    backgroundColor: '#fff',
    marginHorizontal: getResponsivePadding(20),
    marginBottom: getResponsivePadding(32),
    borderRadius: 20,
    padding: getResponsivePadding(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statsTitle: {
    fontSize: getResponsiveSize(20),
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: getResponsivePadding(16),
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsivePadding(10),
    justifyContent: 'space-between',
  },
  statCard: {
    width: SCREEN_WIDTH < 375 ? '100%' : (SCREEN_WIDTH - getResponsivePadding(80)) / 2 - getResponsivePadding(5),
    minWidth: SCREEN_WIDTH < 375 ? '100%' : Math.max(140, (SCREEN_WIDTH - getResponsivePadding(80)) / 2 - getResponsivePadding(5)),
    alignItems: 'center',
    padding: getResponsivePadding(12),
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE5CC',
  },
  statIconContainer: {
    width: getResponsiveSize(44),
    height: getResponsiveSize(44),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsivePadding(8),
  },
  statValue: {
    fontSize: getResponsiveSize(20),
    fontWeight: '800',
    marginBottom: getResponsivePadding(2),
  },
  statLabel: {
    fontSize: getResponsiveSize(10),
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    marginBottom: getResponsivePadding(40),
    paddingHorizontal: getResponsivePadding(20),
  },
  sectionHeader: {
    marginBottom: getResponsivePadding(24),
  },
  sectionHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsivePadding(8),
    marginBottom: getResponsivePadding(8),
  },
  sectionTitle: {
    fontSize: getResponsiveSize(26),
    fontWeight: '800',
    marginBottom: getResponsivePadding(8),
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: getResponsiveSize(15),
    color: '#6b7280',
    lineHeight: getResponsiveSize(22),
  },
  featuresBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FFE5CC',
  },
  featuresBadgeText: {
    fontSize: getResponsiveSize(12),
    fontWeight: '700',
    color: '#FF7A00',
    letterSpacing: 0.3,
  },
  quickActions: {
    gap: getResponsivePadding(14),
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: getResponsivePadding(20),
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIconContainer: {
    width: getResponsiveSize(64),
    height: getResponsiveSize(64),
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getResponsivePadding(16),
    flexShrink: 0,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: getResponsiveSize(18),
    fontWeight: '800',
    marginBottom: getResponsivePadding(4),
    color: '#1a1a1a',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  quickActionDescription: {
    fontSize: getResponsiveSize(13),
    color: '#6b7280',
    lineHeight: getResponsiveSize(18),
    flexShrink: 1,
  },
  quickActionArrow: {
    marginLeft: getResponsivePadding(8),
    flexShrink: 0,
  },
  registerPrompt: {
    marginTop: getResponsivePadding(20),
    flexDirection: 'row',
    alignItems: 'center',
    padding: getResponsivePadding(18),
    backgroundColor: '#FFF7F0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE5CC',
    gap: getResponsivePadding(12),
  },
  registerPromptText: {
    fontSize: getResponsiveSize(14),
    color: '#1a1a1a',
    flex: 1,
    lineHeight: getResponsiveSize(20),
  },
  registerPromptBold: {
    fontWeight: '700',
    color: '#FF7A00',
  },
  featuresGrid: {
    gap: getResponsivePadding(20),
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: getResponsivePadding(24),
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  featureIconContainer: {
    width: getResponsiveSize(72),
    height: getResponsiveSize(72),
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsivePadding(20),
  },
  featureTitle: {
    fontSize: getResponsiveSize(20),
    fontWeight: '800',
    marginBottom: getResponsivePadding(10),
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  featureDescription: {
    fontSize: getResponsiveSize(15),
    color: '#6b7280',
    lineHeight: getResponsiveSize(22),
    marginBottom: getResponsivePadding(20),
  },
  featureLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsivePadding(8),
  },
  featureLinkText: {
    fontSize: getResponsiveSize(15),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ctaSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: getResponsivePadding(32),
    alignItems: 'center',
    marginHorizontal: getResponsivePadding(20),
    marginBottom: getResponsivePadding(20),
    borderWidth: 2,
    borderColor: '#FFE5CC',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaIconContainer: {
    width: getResponsiveSize(80),
    height: getResponsiveSize(80),
    borderRadius: 40,
    backgroundColor: '#FFF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsivePadding(20),
  },
  ctaTitle: {
    fontSize: getResponsiveSize(26),
    fontWeight: '800',
    marginBottom: getResponsivePadding(12),
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  ctaText: {
    fontSize: getResponsiveSize(16),
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: getResponsivePadding(24),
    lineHeight: getResponsiveSize(24),
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingHorizontal: getResponsivePadding(32),
    paddingVertical: getResponsivePadding(16),
    borderRadius: 16,
    gap: getResponsivePadding(8),
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
