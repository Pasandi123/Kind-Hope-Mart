import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
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

type ShopScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ShopPage'>;

const ShopScreen = () => {
  const navigation = useNavigation<ShopScreenNavigationProp>();

  const categories = [
    { name: 'Clothes', screen: 'Clothes' },
    { name: 'Stationery', screen: 'Stationery' },
    { name: 'Furniture', screen: 'Furniture' },
    { name: 'Other', screen: 'Other' },
  ];

  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snapshot = await firestore().collection('donations').get();
        const allItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(allItems);
        setFilteredItems(allItems); // initialize search list
      } catch (error) {
        console.error('Error fetching shop items:', error);
      }
    };

    fetchItems();
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="menu" size={20} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Feather name="search" size={20} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Item Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items</Text>
          <Feather name="chevron-right" size={16} />
        </View>

        <View style={styles.categoryRow}>
          {categories.map((item, index) => {
            let imageSource;
            if (item.name === 'Clothes') {
              imageSource = require('../assets/cloths.png');
            } else if (item.name === 'Stationery') {
              imageSource = require('../assets/stationery.jpg');
            } else if (item.name === 'Furniture') {
              imageSource = require('../assets/sofa.webp');
            } else if (item.name === 'Other') {
              imageSource = require('../assets/other.webp');
            }

            return (
              <TouchableOpacity
                key={index}
                style={styles.categoryItem}
                onPress={() => navigation.navigate(item.screen as any)}
              >
                <Image source={imageSource} style={styles.categoryImage} />
                <Text style={styles.categoryLabel}>{item.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Top Selling Items (All Donations) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Selling</Text>
          <Feather name="chevron-right" size={16} />
        </View>

        <View style={styles.topSellingRow}>
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.productCard}
              onPress={() => navigation.navigate('ItemDetails', { product: item })}
            >
              <Image
                source={{ uri: item.images?.[0] }}
                style={styles.topSellingImage}
                resizeMode="cover"
              />
              <Text style={styles.brand}>{item.category}</Text>
              <Text>{item.description}</Text>
              <Text style={styles.price}>${item.price}</Text>
              <Text style={{ fontSize: 12, color: '#777' }}>{item.condition}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
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

export default ShopScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#f2edf7',
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 14,
    color: '#000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  topSellingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  productCard: {
    width: 150,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  topSellingImage: {
    height: 100,
    width: '100%',
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  brand: {
    color: '#888',
    fontSize: 12,
  },
  price: {
    fontWeight: '600',
    marginTop: 4,
  },
  bottomNav: {
    height: 60,
    borderTopWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
