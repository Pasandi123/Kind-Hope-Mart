import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
};

type ShoppingCartNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ShoppingCart'
>;

type CartItem = {
  firestoreId: string;
  name: string;
  description: string;
  price: string;
  condition: string;
  images: string[];
  addedAt: any;
};

const AddToCartScreen = () => {
  const navigation = useNavigation<ShoppingCartNavigationProp>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});
  const [subtotal, setSubtotal] = useState(0);

  // Load cart items & initialize selection
  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const unsubscribe = firestore()
      .collection('cart')
      .doc(user.uid)
      .collection('items')
      .orderBy('addedAt', 'desc')
      .onSnapshot(snapshot => {
        const items = snapshot.docs.map(doc => ({
          firestoreId: doc.id,
          ...doc.data(),
        })) as CartItem[];
        setCartItems(items);

        // Auto-select all on load
        const defaultSelected: { [key: string]: boolean } = {};
        items.forEach(item => {
          defaultSelected[item.firestoreId] = true;
        });
        setSelectedItems(defaultSelected);
      });

    return () => unsubscribe();
  }, []);

  // ✅ Recalculate subtotal with clean price parsing
  useEffect(() => {
    let total = 0;
    cartItems.forEach(item => {
      if (selectedItems[item.firestoreId]) {
        const cleanPrice = item.price.replace(/[^0-9.]/g, '').replace(/,/g, '');
        const numericPrice = parseFloat(cleanPrice);
        if (!isNaN(numericPrice)) {
          total += numericPrice;
        }
      }
    });
    setSubtotal(total);
  }, [selectedItems, cartItems]);

  const handleDelete = async (firestoreId: string) => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      await firestore()
        .collection('cart')
        .doc(user.uid)
        .collection('items')
        .doc(firestoreId)
        .delete();

      Alert.alert('Deleted', 'Item removed from cart.');

      // Also remove from selectedItems state
      setSelectedItems(prev => {
        const updated = { ...prev };
        delete updated[firestoreId];
        return updated;
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to delete item.');
      console.error('Cart delete error:', err);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev, [id]: !prev[id] };
      return newSelected;
    });
  };

  const toggleSelectAll = () => {
    const allSelected = Object.values(selectedItems).every(v => v);
    const updated: { [key: string]: boolean } = {};
    cartItems.forEach(item => {
      updated[item.firestoreId] = !allSelected;
    });
    setSelectedItems(updated);
  };

  const selectedCount = Object.values(selectedItems).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollArea}>
        {cartItems.length === 0 ? (
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        ) : (
          <>
            <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
              <Text style={styles.selectAllText}>
                {selectedCount === cartItems.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>

            {cartItems.map(item => (
              <View key={item.firestoreId} style={styles.itemRow}>
                <TouchableOpacity
                  onPress={() => toggleSelect(item.firestoreId)}
                  style={styles.checkbox}
                >
                  {selectedItems[item.firestoreId] ? (
                    <Feather name="check-square" size={20} color="#000" />
                  ) : (
                    <Feather name="square" size={20} color="#888" />
                  )}
                </TouchableOpacity>

                <View style={styles.imageBox}>
                  {item.images?.[0] ? (
                    <Image source={{ uri: item.images[0] }} style={styles.image} />
                  ) : (
                    <View style={styles.imagePlaceholder} />
                  )}
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.brand}>{item.name}</Text>
                  <Text>{item.description}</Text>
                  <Text>Condition: {item.condition}</Text>
                  <Text>Qty: 01</Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.firestoreId)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>Remove</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.price}>{item.price}</Text>
              </View>
            ))}
          </>
        )}

        {cartItems.length > 0 && (
          <>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text>Subtotal ({selectedCount})</Text>
              <Text>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Shipping total</Text>
              <Text>Free</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalLabel}>${subtotal.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.orderButton,
                subtotal === 0 && { backgroundColor: '#ccc' },
              ]}
              onPress={() => navigation.navigate('Payment')}
              disabled={subtotal === 0}
            >
              <Text style={styles.orderButtonText}>Buy</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default AddToCartScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollArea: { paddingHorizontal: 20 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  checkbox: {
    marginRight: 8,
    marginTop: 6,
  },
  imageBox: {
    width: 60,
    height: 60,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc',
  },
  itemDetails: { flex: 1 },
  brand: { color: '#aaa', fontSize: 12 },
  price: { fontWeight: '600', alignSelf: 'flex-start' },
  deleteButton: {
    marginTop: 6,
  },
  deleteText: {
    color: 'red',
    fontSize: 13,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  totalLabel: { fontWeight: '600' },
  orderButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  orderButtonText: { color: '#fff', fontWeight: '600' },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  selectAllButton: {
    alignSelf: 'flex-end',
    marginVertical: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: '#007bff',
  },
});
