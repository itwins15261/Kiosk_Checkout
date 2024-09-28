// App.js

import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// 사용자 컨텍스트를 가져옴
import { UserProvider } from './contexts/UserContext';

// 컴포넌트들을 가져옴
import Checkout from './components/CheckoutScreen'; // Checkout 컴포넌트를 불러옴

const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <PaperProvider>
          <Stack.Navigator initialRouteName="Checkout">
            <Stack.Screen
              name="Checkout"
              component={Checkout}
              options={{ title: '결제하기' }}
            />
          </Stack.Navigator>
        </PaperProvider>
      </NavigationContainer>
    </UserProvider>
  );
}
