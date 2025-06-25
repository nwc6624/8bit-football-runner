import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/HomeScreen');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Football Dodger</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontFamily: 'SpaceMono',
  },
}); 