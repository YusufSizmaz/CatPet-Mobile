import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Responsive helper functions
const getResponsiveSize = (size: number) => {
  const scale = SCREEN_WIDTH / 375
  return Math.round(size * scale)
}

const getResponsivePadding = (padding: number) => {
  const scale = SCREEN_WIDTH / 375
  return Math.max(8, Math.round(padding * scale))
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: 'CatPet nedir?',
      answer: 'CatPet, Türkiye\'nin ücretsiz hayvan sahiplendirme ve mama sağlama platformudur. Sokak hayvanlarına yardım etmek, hayvanları ücretsiz sahiplendirmek ve hayvansever topluluğunu birleştirmek için kurulmuştur.',
    },
    {
      question: 'Platform tamamen ücretsiz mi?',
      answer: 'Evet! CatPet tamamen ücretsizdir. Hayvan sahiplendirme, mama noktası ekleme, blog yazısı paylaşma gibi tüm özellikler ücretsizdir. Sadece yazılımsal masraflar, hosting, domain gibi teknik ihtiyaçlar için bağış kabul ediyoruz.',
    },
    {
      question: 'Nasıl hayvan sahiplenebilirim?',
      answer: 'Ana sayfadan "Sahiplen" bölümüne gidin, filtreleri kullanarak istediğiniz hayvan türünü ve şehri seçin. İlgilendiğiniz hayvanın detay sayfasından sahibiyle iletişime geçebilirsiniz.',
    },
    {
      question: 'Mama noktası nasıl eklerim?',
      answer: 'Ana sayfadan "Mama Bırak" bölümüne gidin, haritada konumunuzu işaretleyin ve mama noktası bilgilerini girin. Böylece diğer hayvanseverler de bu noktayı görebilir.',
    },
    {
      question: 'Kayıp hayvan ilanı nasıl veririm?',
      answer: 'Profil sayfanızdan "Kayıp İlanı" sekmesine gidin ve hayvanınızın bilgilerini, fotoğraflarını ve kaybolduğu yeri ekleyin. Topluluk size yardımcı olacaktır.',
    },
  ]

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingTop: 0 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Biz Kimiz?</Text>
            <Text style={styles.heroSubtitle}>
              Hayvanlar için ücretsiz platform
            </Text>
          </View>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Misyonumuz</Text>
          <Text style={styles.sectionText}>
            CatPet olarak, sokak hayvanlarına yardım etmek, hayvanları ücretsiz sahiplendirmek ve hayvansever topluluğunu birleştirmek için çalışıyoruz. Platformumuz tamamen ücretsizdir ve herkesin erişebileceği şekilde tasarlanmıştır.
          </Text>
        </View>

        {/* What We Do Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ne Yapıyoruz?</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="heart" size={getResponsiveSize(22)} color="#FF7A00" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Ücretsiz Sahiplendirme</Text>
                <Text style={styles.featureDescription}>
                  Hayvanlar için ücretsiz sahiplendirme ilanları oluşturun ve sıcak bir yuva bulun.
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="location" size={getResponsiveSize(22)} color="#FF7A00" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Mama Noktaları</Text>
                <Text style={styles.featureDescription}>
                  Şehirdeki mama noktalarını haritada görün ve yeni noktalar ekleyin.
                </Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="chatbubbles" size={getResponsiveSize(22)} color="#FF7A00" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Bilgi Bankası & Forum</Text>
                <Text style={styles.featureDescription}>
                  Hayvanlar hakkında bilgi edinin ve topluluk forumunda deneyimlerinizi paylaşın.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Why Free Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Neden Ücretsiz?</Text>
          <Text style={styles.sectionText}>
            CatPet, hayvanların yardıma ihtiyacı olduğu gerçeğinden yola çıkarak kurulmuştur. Hayvan sahiplendirme, mama sağlama ve topluluk forumu gibi özelliklerin herkes için erişilebilir olması gerektiğine inanıyoruz. Platformumuz tamamen ücretsizdir ve her zaman öyle kalacaktır.
          </Text>
          <Text style={styles.sectionText}>
            Yazılımsal masraflar, hosting, domain ve diğer teknik ihtiyaçlar için bağış kabul ediyoruz. Bu bağışlar sadece platformun çalışması için kullanılır.
          </Text>
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Bize Destek Olun</Text>
          <Text style={styles.supportText}>
            CatPet'in devam edebilmesi için yazılımsal masraflar, hosting, domain ve diğer teknik ihtiyaçlar için bağış kabul ediyoruz.
          </Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => Linking.openURL('https://buymeacoffee.com/catpetapp')}
          >
            <Ionicons name="cafe" size={getResponsiveSize(18)} color="#fff" />
            <Text style={styles.supportButtonText}>Buy Me a Coffee ile Destek Ol</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sıkça Sorulan Sorular</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => toggleFaq(index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={openFaq === index ? 'chevron-up' : 'chevron-down'}
                  size={getResponsiveSize(18)}
                  color="#666"
                />
              </View>
              {openFaq === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
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
    paddingBottom: getResponsivePadding(40),
    paddingTop: 0,
    marginTop: 0,
  },
  heroSection: {
    height: Math.min(getResponsiveSize(180), SCREEN_HEIGHT * 0.28),
    minHeight: 140,
    maxHeight: 220,
    position: 'relative',
    marginTop: 0,
    marginBottom: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: getResponsivePadding(12),
    paddingBottom: getResponsivePadding(14),
  },
  heroTitle: {
    fontSize: getResponsiveSize(24),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: getResponsivePadding(4),
  },
  heroSubtitle: {
    fontSize: getResponsiveSize(14),
    color: '#fff',
  },
  section: {
    padding: getResponsivePadding(20),
  },
  sectionTitle: {
    fontSize: getResponsiveSize(22),
    fontWeight: 'bold',
    marginBottom: getResponsivePadding(14),
    color: '#1a1a1a',
  },
  sectionText: {
    fontSize: getResponsiveSize(15),
    lineHeight: getResponsiveSize(22),
    color: '#666',
    marginBottom: getResponsivePadding(10),
  },
  featureList: {
    gap: getResponsivePadding(18),
  },
  featureItem: {
    flexDirection: 'row',
    gap: getResponsivePadding(14),
    alignItems: 'flex-start',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: getResponsiveSize(17),
    fontWeight: '600',
    marginBottom: getResponsivePadding(4),
    color: '#1a1a1a',
  },
  featureDescription: {
    fontSize: getResponsiveSize(14),
    lineHeight: getResponsiveSize(20),
    color: '#666',
  },
  supportSection: {
    margin: getResponsivePadding(20),
    padding: getResponsivePadding(18),
    backgroundColor: '#FFF7F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5CC',
  },
  supportTitle: {
    fontSize: getResponsiveSize(19),
    fontWeight: 'bold',
    marginBottom: getResponsivePadding(8),
    color: '#1a1a1a',
  },
  supportText: {
    fontSize: getResponsiveSize(14),
    lineHeight: getResponsiveSize(20),
    color: '#666',
    marginBottom: getResponsivePadding(14),
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    padding: getResponsivePadding(14),
    borderRadius: 12,
    gap: getResponsivePadding(8),
  },
  supportButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(15),
    fontWeight: '600',
  },
  faqItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: getResponsivePadding(14),
    marginBottom: getResponsivePadding(10),
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: getResponsiveSize(15),
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: getResponsivePadding(10),
  },
  faqAnswer: {
    fontSize: getResponsiveSize(14),
    lineHeight: getResponsiveSize(20),
    color: '#666',
    marginTop: getResponsivePadding(10),
  },
})

