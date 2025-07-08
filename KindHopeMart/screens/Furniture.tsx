import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ItemDetails: { product: any };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ItemDetails'>;

type Product = {
  id: string;
  name?: string;
  brand?: string;
  description: string;
  price: string;
  images: string[];
  condition: string;
  category: string;
};

const ProductCard: React.FC<{ product: Product; onPress: () => void }> = ({ product, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image
      source={{ uri: product.images?.[0] }}
      style={styles.image}
      resizeMode="cover"
    />
    <Text style={styles.name}>{product.description}</Text>
    <Text style={styles.price}>Price: {product.price}</Text>
    <Text style={styles.condition}>Condition: {product.condition}</Text>
  </TouchableOpacity>
);

export default function Furniture() {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('donations')
      .where('category', '==', 'Furniture')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (querySnapshot) => {
          const items: Product[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            items.push({
              id: doc.id,
              name: data.name,
              brand: data.brand,
              description: data.description,
              price: data.price,
              images: data.images || [],
              condition: data.condition,
              category: data.category,
            });
          });
          setProducts(items);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching donations: ', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3399ff" />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>No donated furniture items found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Furniture</Text>
      </View>

      <View style={styles.productsHeader}>
        <Text style={styles.productsText}>Products</Text>
      </View>

      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ItemDetails', { product: item })}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 26, backgroundColor: '#fff' },
  center: { justifyContent: 'center', alignItems: 'center' },
  banner: {
    backgroundColor: '#f5c6cb',
    padding: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerText: { fontSize: 24, fontWeight: 'bold', fontStyle: 'italic' },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productsText: { fontSize: 18, fontWeight: 'bold' },
  row: { justifyContent: 'space-between', marginBottom: 20 },
  card: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#ddd',
  },
  name: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  price: { fontSize: 14 },
  condition: { fontSize: 12, color: 'gray' },
});
