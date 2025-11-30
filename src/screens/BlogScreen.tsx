import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function BlogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bilgi Bankası</Text>
      <Text>Blog yazıları burada görünecek</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
})

