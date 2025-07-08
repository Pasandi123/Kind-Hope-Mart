import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

type RootStackParamList = {
  Payment: undefined;
  Home: undefined;
  ShopPage: undefined;
  Donation: undefined;
  ShoppingCart: undefined;
  Profile: undefined;
};

type PaymentScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Payment'
>;

const PaymentScreen = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const uploadImageToFirebase = async (uri: string): Promise<string | null> => {
    if (!uri) return null;

    try {
      setUploading(true);
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const storageRef = storage().ref(`paymentSlips/${filename}`);
      let uploadUri = uri.startsWith('file://') ? uri.substring(7) : uri;

      await storageRef.putFile(uploadUri);
      const downloadUrl = await storageRef.getDownloadURL();
      setUploading(false);
      return downloadUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
      return null;
    }
  };

  const handleUploadSlip = async () => {
    try {
      let permissionGranted = true;

      if (Platform.OS === 'android') {
        const sdkVersion = Platform.Version;
        const granted =
          sdkVersion >= 33
            ? await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                {
                  title: 'Gallery Permission',
                  message:
                    'This app needs access to your gallery to upload the payment slip.',
                  buttonPositive: 'OK',
                }
              )
            : await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                  title: 'Storage Permission',
                  message:
                    'This app needs access to your storage to upload the payment slip.',
                  buttonPositive: 'OK',
                }
              );

        permissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        if (!permissionGranted) {
          console.warn('Permission denied');
          return;
        }
      }

      setImageUri(null);
      setUploadedUrl(null);

      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });

      if (result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri || null;
        if (uri) {
          setImageUri(uri);
          const uploaded = await uploadImageToFirebase(uri);
          if (uploaded) {
            console.log('Uploaded file URL:', uploaded);
            setUploadedUrl(uploaded);
          } else {
            console.warn('Failed to upload image');
          }
        }
      }
    } catch (error) {
      console.warn('Image selection error:', error);
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    return /^\d{10}$/.test(phone);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Payment Slip Image:</Text>

      <TouchableOpacity style={styles.uploadBox} onPress={handleUploadSlip}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: '100%', borderRadius: 8 }}
            resizeMode="cover"
          />
        ) : (
          <Feather name="upload" size={24} color="#555" />
        )}
      </TouchableOpacity>

      {uploading && (
        <Text style={{ color: 'blue', marginBottom: 10 }}>
          Uploading image, please wait...
        </Text>
      )}

      {uploadedUrl && (
        <Text style={{ color: 'green', marginBottom: 10 }}>
          Uploaded URL: {uploadedUrl}
        </Text>
      )}

      <ScrollView contentContainerStyle={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, styles.addressInput]}
          placeholder="Add shipping address"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => {
            if (
              !firstName ||
              !lastName ||
              !email ||
              !phone ||
              !address ||
              !uploadedUrl
            ) {
              Alert.alert(
                '⚠️ Missing Information',
                'Please fill all fields and upload a payment slip.'
              );
            } else if (!validatePhoneNumber(phone)) {
              Alert.alert(
                '⚠️ Invalid Phone Number',
                'Please enter a valid 10-digit phone number.'
              );
            } else {
              Alert.alert(
                '✅ Order Successful',
                'Your order has been placed successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Home'),
                  },
                ]
              );
            }
          }}
        >
          <Text style={styles.orderButtonText}>Place order</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomTab}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Feather name="home" size={22} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ShopPage')}>
          <Feather name="shopping-bag" size={22} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Donation')}
          style={styles.donationButton}
        >
          <Text style={styles.donationText}>Donation</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ShoppingCart')}>
          <Feather name="shopping-cart" size={22} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Feather name="user" size={22} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 10,
  },
  uploadBox: {
    width: '100%',
    height: 150,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  form: {
    paddingBottom: 100,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  orderButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  donationButton: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  donationText: {
    color: '#fff',
    fontSize: 12,
  },
});
