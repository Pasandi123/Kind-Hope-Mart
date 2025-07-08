import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type RootStackParamList = {
  Home: undefined;
  ShopPage: undefined;
  Donation: undefined;
  ShoppingCart: undefined;
  Profile: undefined;
  EditProfile: { profile: any };
   Clothes: undefined;
  Stationery: undefined;
  Furniture: undefined;
  Other: undefined;
  Payment: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  const fetchProfile = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfile({
            firstName: data?.firstName || '',
            lastName: data?.lastName || '',
            email: data?.email || '',
            phone: data?.phone || '',
            address: data?.address || '',
          });
        } else {
          Alert.alert('No user profile found in Firestore.');
        }
      }
    } catch (error: any) {
      Alert.alert('Error fetching profile', error.message);
    }
  };

  // Refresh profile every time screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileRow}>
          <View style={styles.avatar} />
          <Text style={styles.userName}>
            {profile.firstName} {profile.lastName}
          </Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile', { profile })}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            placeholder="First Name"
            style={styles.input}
            value={profile.firstName}
            onChangeText={text => handleChange('firstName', text)}
            editable={false}
          />
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            placeholder="Last Name"
            style={styles.input}
            value={profile.lastName}
            onChangeText={text => handleChange('lastName', text)}
            editable={false}
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={profile.email}
            editable={false}
          />
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="Phone Number"
            style={styles.input}
            value={profile.phone}
            onChangeText={text => handleChange('phone', text)}
            editable={false}
          />
          <Text style={styles.label}>My Address</Text>
          <TextInput
            placeholder="Add Your Address"
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
            value={profile.address}
            onChangeText={text => handleChange('address', text)}
            editable={false}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomTab}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={22} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ShopPage')}>
          <Feather name="shopping-bag" size={22} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Donation')} style={styles.donationButton}>
          <Text style={styles.donationText}>Donation</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ShoppingCart')}>
          <Feather name="shopping-cart" size={22} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Feather name="user" size={22} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee' },
  userName: { flex: 1, marginLeft: 16, fontSize: 16, fontWeight: '600' },
  editButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  editText: { fontSize: 12, fontWeight: '500' },
  form: { marginTop: 10 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 4, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 36,
    fontSize: 14,
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  donationButton: { backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  donationText: { color: '#fff', fontSize: 12 },
});
