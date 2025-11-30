import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useAuth } from '../contexts/AuthContext'

export default function HomeScreen() {
  const { user } = useAuth()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
  },
})

