import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { useAuth } from '../contexts/AuthContext'

export default function ProfileScreen() {
  const { user, logout } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      {user && (
        <>
          <Text style={styles.info}>Email: {user.email}</Text>
          <Text style={styles.info}>İsim: {user.displayName || 'Belirtilmemiş'}</Text>
        </>
      )}
      <Button title="Çıkış Yap" onPress={logout} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
})

