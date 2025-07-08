import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

// 🔹 Add embedding generation function
async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer YOUR_OPENAI_API_KEY`, // ❗ Replace with secure method later
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small',
      }),
    });

    const result = await response.json();
    return result.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

const categories = ['Clothes', 'Stationary', 'Furniture', 'Other'];
const conditions = ['New', 'Used - Like New', 'Used - Acceptable'];

export default function DonationScreen() {
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [price, setPrice] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [images, setImages] = useState<any[]>([null, null]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectImage = async (index: number) => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (result.didCancel) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${asset.fileName || `image-${index}`}`;
      const reference = storage().ref(`/donationImages/${fileName}`);
      await reference.putFile(asset.uri);
      const downloadURL = await reference.getDownloadURL();

      setImages((prev) => {
        const updated = [...prev];
        updated[index] = { ...asset, downloadURL };
        return updated;
      });
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert('Upload Failed', 'Could not upload image. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !description ||
      !selectedCategory ||
      !selectedCondition ||
      !price ||
      !contactNumber ||
      !email ||
      !images[0]?.downloadURL ||
      !images[1]?.downloadURL
    ) {
      Alert.alert('Missing Fields', 'Please fill all fields and upload 2 images.');
      return;
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a 10-digit phone number.');
      return;
    }

    try {
      setSubmitting(true);

      // 🧠 Generate embedding vector
      const textToEmbed = `${description} ${selectedCategory} ${selectedCondition}`;
      const vector = await generateEmbedding(textToEmbed);

      await firestore().collection('donations').add({
        description,
        category: selectedCategory,
        condition: selectedCondition,
        price,
        contactNumber,
        email,
        images: [images[0].downloadURL, images[1].downloadURL],
        createdAt: firestore.FieldValue.serverTimestamp(),
        vector, // ✅ save the embedding here
      });

      Alert.alert('Success', 'Donation submitted successfully.');
      setDescription('');
      setSelectedCategory('');
      setSelectedCondition('');
      setPrice('');
      setContactNumber('');
      setEmail('');
      setImages([null, null]);
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Failed to submit donation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add a Donation</Text>

        <Text style={styles.sectionLabel}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Write a description..."
          multiline
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.sectionLabel}>Select Category</Text>
        <View style={styles.chipContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selectedCategory === cat && styles.chipSelected]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[styles.chipText, selectedCategory === cat && styles.chipTextSelected]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Condition</Text>
        <View style={styles.chipContainer}>
          {conditions.map((cond) => (
            <TouchableOpacity
              key={cond}
              style={[styles.chip, selectedCondition === cond && styles.chipSelected]}
              onPress={() => setSelectedCondition(cond)}
            >
              <Text
                style={[styles.chipText, selectedCondition === cond && styles.chipTextSelected]}
              >
                {cond}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Price (LKR)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter price"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.sectionLabel}>Contact Number</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          placeholder="Enter phone number"
          value={contactNumber}
          onChangeText={setContactNumber}
        />

        <Text style={styles.sectionLabel}>Email</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.sectionLabel}>Upload Images</Text>
        {[0, 1].map((i) => (
          <TouchableOpacity
            key={i}
            style={styles.imageBox}
            onPress={() => selectImage(i)}
          >
            {images[i]?.uri ? (
              <Image
                source={{ uri: images[i].uri }}
                style={{ width: '100%', height: '100%', borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : uploading ? (
              <ActivityIndicator color="#555" />
            ) : (
              <>
                <Feather name="upload" size={20} color="#555" />
                <Text style={{ color: '#555' }}>Upload Image {i + 1}</Text>
              </>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={submitting || uploading}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Submit Donation</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  chipText: {
    fontSize: 12,
    color: '#333',
  },
  chipTextSelected: {
    color: '#fff',
  },
  imageBox: {
    height: 300,
    backgroundColor: '#eee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
});
