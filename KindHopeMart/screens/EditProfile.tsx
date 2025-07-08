import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

type RootStackParamList = {
  EditProfile: { profile: ProfileData };
};

type EditProfileRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;
type EditProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export default function EditProfile() {
  const route = useRoute<EditProfileRouteProp>();
  const navigation = useNavigation<EditProfileNavigationProp>();
  const { profile } = route.params;
  const [editedProfile, setEditedProfile] = useState<ProfileData>(profile);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const user = auth().currentUser;
      if (user) {
        await firestore().collection('users').doc(user.uid).update(editedProfile);
        Alert.alert('Success', 'Profile updated successfully.');
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Error updating profile', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {(['firstName', 'lastName', 'email', 'phone', 'address'] as (keyof ProfileData)[]).map((field) => (
          <View key={field} style={styles.inputGroup}>
            <Text style={styles.label}>{field.replace(/^\w/, (c) => c.toUpperCase())}</Text>
            <TextInput
              value={editedProfile[field]}
              onChangeText={(text) => handleChange(field, text)}
              style={[styles.input, field === 'address' && styles.textArea]}
              editable={field !== 'email'}
              multiline={field === 'address'}
              numberOfLines={field === 'address' ? 3 : 1}
            />
          </View>
        ))}

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 30 },
  inputGroup: { marginBottom: 40 },
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '600' },
});
