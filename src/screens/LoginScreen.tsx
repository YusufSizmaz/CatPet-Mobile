import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native'
import { useAuth } from '../contexts/AuthContext'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const { login, register } = useAuth()

  const handleSubmit = async () => {
    try {
      if (isRegister) {
        await register(email, password, firstName, lastName)
      } else {
        await login(email, password)
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
      </Text>
      
      {isRegister && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Ad"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Soyad"
            value={lastName}
            onChangeText={setLastName}
          />
        </>
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Button
        title={isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
        onPress={handleSubmit}
      />
      
      <Button
        title={isRegister ? 'Zaten hesabım var' : 'Hesap oluştur'}
        onPress={() => setIsRegister(!isRegister)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
})

