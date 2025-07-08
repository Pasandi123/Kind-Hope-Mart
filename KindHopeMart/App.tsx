import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './screens/Login';
import Home from './screens/Home';
import ProfileScreen from './screens/ProfileScreen';
import DonationScreen from './screens/DonationScreen';
import ShoppingCart from './screens/ShoppingCart';
import ShopPage from './screens/ShopPage';
import Furniture from './screens/Furniture';
import Clothes from './screens/Cloths';
import Stationery from './screens/Stationery';
import Other from './screens/Other';
import EditProfile from './screens/EditProfile';
import Payment from './screens/Payment';
import ItemDetails from './screens/ItemDetails';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Donation" component={DonationScreen} />
        <Stack.Screen name="ShoppingCart" component={ShoppingCart} />
        <Stack.Screen name="ShopPage" component={ShopPage} />
        <Stack.Screen name="Furniture" component={Furniture} />
        <Stack.Screen name="Clothes" component={Clothes} />
        <Stack.Screen name="Stationery" component={Stationery} />
        <Stack.Screen name="Other" component={Other} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name='Payment' component={Payment}/>
        <Stack.Screen name="ItemDetails" component={ItemDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
