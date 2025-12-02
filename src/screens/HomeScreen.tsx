import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

export default function HomeScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()
  const isLoggedIn = !!user

  const actions = [
    {
      title: 'Sahiplen',
      description: 'Yeni bir dost arıyorsanız',
      icon: 'paw',
      link: 'Animals',
    },
    {
      title: 'Mama Bırak',
      description: 'Sokak hayvanlarına yardım edin',
      icon: 'location',
      link: 'FoodPoints',
    },
    {
      title: 'Kayıp İlanı',
      description: 'Kayıp hayvanınızı bulun',
      icon: 'search',
      link: 'LostAnimal',
    },
    {
      title: 'Bilgi Bankası',
      description: 'Uzman bilgilerine ulaşın',
      icon: 'book',
      link: 'Blog',
    },
  ]

  const features = [
    {
      icon: 'paw',
      title: 'Sahiplenme İlanları',
      description: 'Farklı cins ve yaşlardan yüzlerce dostumuz yeni yuvasını arıyor. Profilinizi oluşturun, hayatınızın dostuyla tanışın.',
      link: 'Animals',
      linkText: 'İlanları Görüntüle',
    },
    {
      icon: 'location',
      title: 'Mama Bırakma Noktaları',
      description: 'Harita üzerinden mama ve su kaplarının konumlarını görün, yeni noktalar ekleyerek sokaktaki canları doyurun.',
      link: 'FoodPoints',
      linkText: 'Haritayı Aç',
    },
    {
      icon: 'book',
      title: 'Bilgilendirme Merkezi',
      description: 'Hayvan bakımı, sağlığı, eğitimi ve acil durum müdahaleleri hakkında uzmanlar tarafından hazırlanmış makalelere ulaşın.',
      link: 'Blog',
      linkText: 'Makaleleri Oku',
    },
  ]

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Ionicons name="paw" size={16} color="#FF7A00" />
            <Text style={styles.heroBadgeText}>Tüm Hayvan Dostlarımız İçin</Text>
          </View>
          <Text style={styles.title}>Sevgi Dolu Bir Yuvaya Kavuşmaları İçin El Ele</Text>
          <Text style={styles.description}>
            CatPet, Türkiye genelindeki tüm hayvan dostlarımızı sahiplendirme, besleme ve bilgilendirme misyonuyla bir araya getiren bir topluluk platformudur.
          </Text>
          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate('Animals' as never)}
            >
              <Ionicons name="compass-outline" size={20} color="#fff" />
              <Text style={styles.heroButtonText}>Keşfetmeye Başla</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.heroButton, styles.heroButtonOutline]}
              onPress={() => navigation.navigate('About' as never)}
            >
              <Ionicons name="information-circle-outline" size={20} color="#FF7A00" />
              <Text style={[styles.heroButtonText, styles.heroButtonTextOutline]}>Hakkımızda</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroFeatures}>
            <View style={styles.heroFeature}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.heroFeatureText}>Tamamen Ücretsiz</Text>
            </View>
            <View style={styles.heroFeature}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.heroFeatureText}>Kolay Kullanım</Text>
            </View>
            <View style={styles.heroFeature}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.heroFeatureText}>Güvenli Platform</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
            <Text style={styles.sectionSubtitle}>
              Ne yapmak istiyorsunuz? Size en uygun seçeneği seçin.
            </Text>
          </View>
          <View style={styles.quickActions}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.title}
                style={styles.quickActionCard}
                onPress={() => navigation.navigate(action.link as never)}
              >
                <View style={styles.quickActionIconContainer}>
                  <Ionicons name={action.icon as any} size={28} color="#FF7A00" />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionDescription}>{action.description}</Text>
                </View>
                <Ionicons name="arrow-forward-outline" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
          {!isLoggedIn && (
            <View style={styles.registerPrompt}>
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
              <Ionicons name="star" size={16} color="#FF7A00" />
              <Text style={styles.featuresBadgeText}>Özelliklerimiz</Text>
            </View>
            <Text style={styles.sectionTitle}>Platformumuzun Sundukları</Text>
            <Text style={styles.sectionSubtitle}>
              Hayvanseverler için tasarlanmış modüler özelliklerimizle, dostlarımıza yardım etmek artık daha kolay ve etkili.
            </Text>
          </View>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <View key={feature.title} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon as any} size={32} color="#FF7A00" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
                <TouchableOpacity
                  style={styles.featureLink}
                  onPress={() => navigation.navigate(feature.link as never)}
                >
                  <Text style={styles.featureLinkText}>{feature.linkText}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FF7A00" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        {!isLoggedIn && (
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Hemen Başlayın</Text>
            <Text style={styles.ctaText}>
              CatPet'e katılın ve hayvanlar için fark yaratın
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={styles.ctaButtonText}>Giriş Yap / Kayıt Ol</Text>
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
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  heroSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF7A00',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  heroButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    padding: 14,
    borderRadius: 24,
    gap: 8,
  },
  heroButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF7A00',
  },
  heroButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  heroButtonTextOutline: {
    color: '#FF7A00',
  },
  heroFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  heroFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroFeatureText: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featuresBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  featuresBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF7A00',
  },
  quickActions: {
    gap: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 12,
  },
  quickActionIconContainer: {
    backgroundColor: '#FFF7F0',
    padding: 12,
    borderRadius: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#666',
  },
  registerPrompt: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFF7F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE5CC',
  },
  registerPromptText: {
    fontSize: 12,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  registerPromptBold: {
    fontWeight: '600',
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  featureIconContainer: {
    backgroundColor: '#FFF7F0',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF7A00',
  },
  ctaSection: {
    backgroundColor: '#FFF7F0',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE5CC',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  ctaText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

