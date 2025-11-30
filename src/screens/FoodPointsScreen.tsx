import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function FoodPointsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mama Bırak</Text>
      <Text>Mama noktaları haritası burada görünecek</Text>
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

