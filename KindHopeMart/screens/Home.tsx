import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Donation: undefined;
  ShoppingCart: undefined;
  ShopPage: undefined;
  Clothes: undefined;
  Stationery: undefined;
  Furniture: undefined;
  Other: undefined;
  Payment: undefined;
  ItemDetails: { product: any };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const categories = [
    { name: 'Clothes', screen: 'Clothes', image: require('../assets/cloths.png') },
    { name: 'Stationery', screen: 'Stationery', image: require('../assets/stationery.jpg') },
    { name: 'Furniture', screen: 'Furniture', image: require('../assets/sofa.webp') },
    { name: 'Other', screen: 'Other', image: require('../assets/other.webp') },
  ];

  const bannerImages = [
    require('../assets/bannerpic1.jpg'),
    require('../assets/bannerpic2.jpg'),
    require('../assets/bannerpic3.jpg'),
    require('../assets/bannerpic4.jpg'),
    require('../assets/bannerpic5.jpeg'),
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snapshot = await firestore()
          .collection('donations')
          .get();

        const allItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setItems(allItems);
        setFilteredItems(allItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = items.filter(item =>
        item.name?.toLowerCase().includes(lower) ||
        item.description?.toLowerCase().includes(lower)
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KindHope Mart</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        <View style={styles.searchContainer}>
          <Feather name="menu" size={20} color="black" />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <Feather name="search" size={20} color="black" />
        </View>

        <View style={styles.banner}>
          <Image
            source={bannerImages[currentBannerIndex]}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <Text style={styles.bannerText}>KindHope Mart</Text>
          <View style={styles.dotContainer}>
            {bannerImages.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentBannerIndex && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items</Text>
          <Feather name="chevron-right" size={18} />
        </View>

        <View style={styles.categoryContainer}>
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
              onPress={() => navigation.navigate(cat.screen as any)}
            >
              <Image
                source={cat.image}
                style={styles.categoryImage}
                resizeMode="cover"
              />
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Products</Text>
          <Feather name="chevron-right" size={18} />
        </View>

        <FlatList
          horizontal
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate('ItemDetails', { product: item })}
            >
              <Image
                source={{ uri: item.images?.[0] }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <Text style={{ fontSize: 15, color: '#000'}} numberOfLines={2}>{item.description}</Text>
              <Text style={styles.productBrand}>{item.brand}</Text>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price}</Text>
              <Text style={{ fontSize: 12, color: '#222' }}>{item.condition}</Text>
            </TouchableOpacity>
          )}
        />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2edf7',
    marginHorizontal: 16,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginHorizontal: 8 },
  banner: {
    backgroundColor: '#ffe4ec',
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 16,
  },
  bannerImage: { width: '100%', height: 150, borderRadius: 8, marginBottom: 8 },
  bannerText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  dotContainer: { flexDirection: 'row', marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ccc', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#333' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
  categoryItem: { alignItems: 'center' },
  categoryImage: { width: 70, height: 70, borderRadius: 35, marginBottom: 6 },
  categoryText: { fontSize: 12 },
  productCard: {
    marginTop: 20,
    width: 140,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginRight: 16,
  },
  productImage: {
    height: 150,
    width: '100%',
    borderRadius: 8,
    marginBottom: 8,
  },
  productBrand: { fontSize: 12, color: '#666' },
  productName: { fontSize: 14, fontWeight: 'bold', marginVertical: 2 },
  productPrice: { fontSize: 14, color: '#333' },
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
  donationText: { color: '#fff', fontSize: 12 },
});
