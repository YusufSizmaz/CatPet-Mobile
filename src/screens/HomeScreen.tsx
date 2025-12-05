import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

export default function HomeScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const isLoggedIn = !!user

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
              <Ionicons name="sparkles" size={16} color="#FF7A00" />
              <Text style={styles.heroBadgeText}>Tüm Hayvan Dostlarımız İçin</Text>
            </View>
            <Text style={styles.title}>
              Sevgi Dolu Bir Yuvaya{'\n'}Kavuşmaları İçin El Ele
            </Text>
            <Text style={styles.description}>
              CatPet, Türkiye genelindeki tüm hayvan dostlarımızı sahiplendirme, besleme ve bilgilendirme misyonuyla bir araya getiren bir topluluk platformudur.
            </Text>
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.heroButton}
                onPress={() => navigation.navigate('Animals' as never)}
                activeOpacity={0.8}
              >
                <Ionicons name="compass" size={20} color="#fff" />
                <Text style={styles.heroButtonText}>Keşfetmeye Başla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.heroButton, styles.heroButtonOutline]}
                onPress={() => navigation.navigate('About' as never)}
                activeOpacity={0.8}
              >
                <Ionicons name="information-circle" size={20} color="#FF7A00" />
                <Text style={[styles.heroButtonText, styles.heroButtonTextOutline]}>Hakkımızda</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroFeatures}>
              <View style={styles.heroFeature}>
                <View style={styles.heroFeatureIcon}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                </View>
                <Text style={styles.heroFeatureText}>Tamamen Ücretsiz</Text>
              </View>
              <View style={styles.heroFeature}>
                <View style={styles.heroFeatureIcon}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                </View>
                <Text style={styles.heroFeatureText}>Kolay Kullanım</Text>
              </View>
              <View style={styles.heroFeature}>
                <View style={styles.heroFeatureIcon}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                </View>
                <Text style={styles.heroFeatureText}>Güvenli Platform</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Topluluğumuzun Gücü</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
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
                  <Ionicons name="chevron-forward" size={20} color={action.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {!isLoggedIn && (
            <View style={styles.registerPrompt}>
              <Ionicons name="star" size={20} color="#FF7A00" />
              <Text style={styles.registerPromptText}>
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
              <Ionicons name="sparkles" size={16} color="#FF7A00" />
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
                  <Ionicons name={feature.icon as any} size={36} color={feature.color} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                <View style={styles.featureLink}>
                  <Text style={[styles.featureLinkText, { color: feature.color }]}>{feature.linkText}</Text>
                  <Ionicons name="arrow-forward-circle" size={20} color={feature.color} />
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
    padding: 24,
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 40,
    position: 'relative',
    zIndex: 1,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 28,
    marginBottom: 24,
    gap: 8,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#FFE5CC',
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF7A00',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 18,
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: -0.8,
    paddingHorizontal: 4,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 25,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 12,
    fontWeight: '400',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  heroButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    padding: 17,
    borderRadius: 18,
    gap: 8,
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
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroButtonTextOutline: {
    color: '#FF7A00',
  },
  heroFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
  },
  heroFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  heroFeatureIcon: {
    // Icon wrapper
  },
  heroFeatureText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  statsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 80) / 2,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE5CC',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7A00',
    letterSpacing: 0.3,
  },
  quickActions: {
    gap: 14,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  quickActionDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  quickActionArrow: {
    marginLeft: 8,
  },
  registerPrompt: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#FFF7F0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE5CC',
    gap: 12,
  },
  registerPromptText: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
    lineHeight: 20,
  },
  registerPromptBold: {
    fontWeight: '700',
    color: '#FF7A00',
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  featureIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  featureDescription: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  featureLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureLinkText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ctaSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFE5CC',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  ctaText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
