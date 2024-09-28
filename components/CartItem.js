// components/CartItem.js

import React from 'react';
import { Text } from 'react-native';
import { List, Avatar, Divider } from 'react-native-paper';
import styles from '../styles/CheckoutStyles';

// 숫자를 천 단위로 콤마로 구분하는 함수
const formatNumber = (num) =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// 개별 장바구니 아이템을 표시하는 컴포넌트
const CartItem = ({ item }) => {
  return (
    <>
      {/* 각 장바구니 아이템을 표시하는 List.Item 컴포넌트 */}
      <List.Item
        // 아이템 이름을 title로 표시
        title={item.name}
        // 아이템의 수량을 description으로 표시
        description={`${item.quantity}잔`}
        // 오른쪽에 아이템 가격을 표시하는 Text 컴포넌트
        right={() => (
          <Text style={styles.itemPrice}>
            {formatNumber(item.price * item.quantity)}원
          </Text>
        )}
        // 왼쪽에 커피 아이콘을 표시하는 Avatar.Icon 컴포넌트
        left={() => <Avatar.Icon size={40} icon="coffee" />}
        // 제목 스타일 적용
        titleStyle={styles.titleStyle}
        // 설명 텍스트 스타일 적용
        descriptionStyle={styles.descriptionText}
      />
      {/* 아이템 간 회색 구분선 추가 */}
      <Divider style={styles.divider} />
    </>
  );
};

export default CartItem;
