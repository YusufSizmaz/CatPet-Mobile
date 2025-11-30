import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

export default function HomeScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>CatPet'e Hoş Geldiniz!</Text>
          {user && (
            <Text style={styles.subtitle}>
              Merhaba, {user.displayName || user.email}
            </Text>
          )}
          <Text style={styles.description}>
            Hayvanlar için ücretsiz sahiplendirme ve mama noktaları platformu
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Animals' as never)}
            >
              <Ionicons name="paw" size={32} color="#FF7A00" />
              <Text style={styles.quickActionText}>Sahiplen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('FoodPoints' as never)}
            >
              <Ionicons name="location" size={32} color="#FF7A00" />
              <Text style={styles.quickActionText}>Mama Bırak</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Blog' as never)}
            >
              <Ionicons name="book" size={32} color="#FF7A00" />
              <Text style={styles.quickActionText}>Bilgi Bankası</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('About' as never)}
            >
              <Ionicons name="information-circle" size={32} color="#FF7A00" />
              <Text style={styles.quickActionText}>Hakkımızda</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Özellikler</Text>
          <View style={styles.featureCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Tamamen Ücretsiz</Text>
              <Text style={styles.featureDescription}>
                Tüm özellikler ücretsizdir. Hayvan sahiplendirme, mama noktası ekleme ve daha fazlası.
              </Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Kolay Kullanım</Text>
              <Text style={styles.featureDescription}>
                Basit ve kullanıcı dostu arayüz ile kolayca hayvan sahiplenebilir veya ilan verebilirsiniz.
              </Text>
            </View>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Güvenli Platform</Text>
              <Text style={styles.featureDescription}>
                Firebase Authentication ile güvenli giriş ve veri koruması.
              </Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        {!user && (
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
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 12,
    color: '#666',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

