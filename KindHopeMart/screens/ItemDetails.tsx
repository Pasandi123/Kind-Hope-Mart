import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Product = {
  id: string;
  name?: string;
  description: string;
  price: string;
  condition: string;
  images: string[];
  contactNumber?: string;
  email?: string;
};

type RootStackParamList = {
  ItemDetails: { product: Product };
  ShoppingCart: undefined;
  // add other screens as needed
};

export default function ItemDetails() {
  const route = useRoute<RouteProp<RootStackParamList, 'ItemDetails'>>();
  const product = route.params.product;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleDelete = async () => {
    try {
      await firestore().collection('donations').doc(product.id).delete();
      Alert.alert('Deleted', 'Item has been deleted.');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Failed to delete item.');
    }
  };

  const handleAddToCart = async () => {
    const user = auth().currentUser;

    if (!user) {
      Alert.alert('Error', 'You must be logged in to add items to cart.');
      return;
    }

    try {
      await firestore()
        .collection('cart')
        .doc(user.uid)
        .collection('items')
        .add({
          ...product,
          addedAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert('Added', 'Item added to cart.');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {(product.images && product.images.length > 0) ? (
        product.images.map((imgUrl, index) => (
          <Image
            key={index}
            source={{ uri: imgUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ))
      ) : (
        <View style={[styles.image, styles.center]}>
          <Text>No Images Available</Text>
        </View>
      )}

      
      <Text style={styles.detail}>Condition: {product.condition || 'N/A'}</Text>
      <Text style={styles.detail}>Price: ${product.price}</Text>
      <Text style={styles.detail}>Description: {product.description || 'No description'}</Text>
      <Text style={styles.detail}>Contact: {product.contactNumber || 'N/A'}</Text>
      <Text style={styles.detail}>Email: {product.email || 'N/A'}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#ddd',
  },
  center: { justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  detail: { fontSize: 16, marginBottom: 6 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cartButton: {
    flex: 1,
    backgroundColor: '#0a0',
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#a00',
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
