// components/Checkout.js

import React, { useState, useContext } from 'react';
import { View, Text, FlatList, ScrollView, ToastAndroid, Alert, Platform, TouchableWithoutFeedback, } from 'react-native';
import { Appbar, Button, Card, Divider, Portal, TextInput as PaperTextInput, } from 'react-native-paper';

import CartItem from './CartItem'; // 장바구니의 개별 아이템을 표시하는 컴포넌트
import CouponModal from './CouponModal'; // 쿠폰 선택 모달
import PaymentMethodModal from './PaymentMethodModal'; // 결제 수단을 선택할 수 있는 모달
import styles from '../styles/CheckoutStyles'; // 스타일을 가져옴
import { UserContext } from '../contexts/UserContext'; // 사용자 데이터를 관리하는 컨텍스트

// 숫자를 천 단위로 콤마로 구분해주는 함수
const formatNumber = (num) =>
  num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const Checkout = () => {
  // 사용자 컨텍스트에서 포인트, 쿠폰, 결제 수단 정보를 가져옴
  // firebase 연동하기 위해 데이터 분리
  const {
    points: availablePoints,
    coupons,
    paymentMethods,
    updatePoints,
    markCouponAsUsed,
    addPoints,
  } = useContext(UserContext);

  // 장바구니 아이템들 (예시 데이터)
  const [cartItems] = useState([
    { id: '1', name: '아메리카노 ICE', price: 3000, quantity: 2 },
    { id: '2', name: '카페 라떼 HOT', price: 4000, quantity: 3 },
  ]);

  // 각종 상태 값들
  const [couponModalVisible, setCouponModalVisible] = useState(false); // 쿠폰 모달 표시 여부
  const [paymentModalVisible, setPaymentModalVisible] = useState(false); // 결제 수단 모달 표시 여부
  const [selectedCoupon, setSelectedCoupon] = useState(null); // 선택된 쿠폰
  const [usedPoints, setUsedPoints] = useState(0); // 사용한 포인트
  const [pointInput, setPointInput] = useState(''); // 사용자가 입력한 포인트
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null); // 선택된 결제 수단
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);

  // 장바구니 총 금액 계산
  const getSubtotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 쿠폰에 따른 할인 금액 계산
  const getDiscountAmount = (subtotal, coupon) => {
    if (!coupon) return 0; // 쿠폰이 없으면 할인 X
    if (coupon.minAmount <= subtotal) {
      // 주문 금액이 쿠폰 사용 최소 금액을 넘는 경우
      if (coupon.discount) {
        // 고정 금액 할인
        return coupon.discount;
      } else if (coupon.discountRate) {
        // 비율 할인
        return subtotal * coupon.discountRate;
      }
    }
    return 0; // 쿠폰 조건을 만족하지 않으면 할인 없음
  };

  // 최종 결제 금액 계산 (할인과 포인트 적용된 금액)
  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = getDiscountAmount(subtotal, selectedCoupon);
    const total = subtotal - discount - usedPoints;
    return total > 0 ? total : 0; // 최종 금액이 0보다 커야 함
  };

  // 적립될 포인트 계산 (총 금액의 2% 적립)
  const getEarnedPoints = () => {
    const total = getTotal();
    return Math.floor(total * 0.02);
  };

  // 결제 수단을 선택하는 함수
  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentType(method.type);
    if (!method.isRegistered) {
      setPaymentModalVisible(true);
    } else {
      setSelectedPaymentMethod(method);
    }
  };

  // 사용 가능한 쿠폰이 있는지 여부를 확인
  const hasAvailableCoupons = coupons.some(
    (coupon) => !coupon.used && getSubtotal() >= coupon.minAmount
  );

  // 포인트 입력값을 초기화하는 함수
  const resetPoints = () => {
    setPointInput('');
    setUsedPoints(0);
  };

  // 입력된 포인트 적용
  const applyPoints = (value) => {
    const points = parseInt(value, 10); // 입력값을 숫자로 변환

    // 비정상적인 입력 처리 (NaN, 음수, 0, 보유 포인트보다 큰 값)
    if (isNaN(points) || points <= 0) {
      showToast('사용할 포인트를 정확히 입력하세요.');
      resetPoints();
      return;
    }

    if (points > availablePoints) {
      showToast('보유한 포인트보다 많이 사용할 수 없습니다.');
      resetPoints();
    } else {
      setUsedPoints(points); // 사용한 포인트 적용
    }
  };

  // Toast 알림을 표시하는 함수
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('알림', message);
    }
  };

  // 사용 가능한 포인트 모두 적용
  const handleFullPointsUsage = () => {
    setPointInput(availablePoints.toString());
    setUsedPoints(availablePoints);
  };

  // 포인트 사용 취소
  const cancelPoints = () => {
    resetPoints(); // 포인트 값 초기화
  };

  // 쿠폰 사용 취소
  const cancelCoupon = () => {
    setSelectedCoupon(null); // 선택된 쿠폰 초기화
  };

  // 결제 처리 함수
const handlePayment = () => {
  if (!selectedPaymentMethod) { // 결제 수단을 선택하지 않고 결제하기 버튼을 누른 경우
    showToast('결제 수단을 선택해주세요.');
    return;
  }

  // 결제 완료 후 처리
  const earnedPoints = getEarnedPoints(); // 포인트 적립 계산
  if (selectedCoupon) {
    markCouponAsUsed(selectedCoupon.id); // 쿠폰 사용 완료로 처리
    setSelectedCoupon(null); // 선택된 쿠폰 초기화
  }
  if (usedPoints > 0) {
    updatePoints(availablePoints - usedPoints); // 사용한 포인트 차감
    resetPoints(); // 포인트 입력값 초기화
  }

  // 포인트 적립 처리
  if (earnedPoints > 0) {
    addPoints(earnedPoints); // 적립 포인트 추가
  }

  Alert.alert('결제 완료', `결제가 완료되었습니다. 적립되는 포인트: ${formatNumber(earnedPoints)}점`);
};

  return (
    <ScrollView style={styles.container}>
      {/* 상단 앱바 */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction
          onPress={() =>
            Alert.alert('장바구니로 이동', '장바구니 화면으로 이동합니다.')
          }
        />
        <Appbar.Content title="결제하기" />
      </Appbar.Header>

      {/* 주문 내역 표시 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}> 주문 내역</Text>
        <Card style={[styles.card, styles.roundedCard]}>
          <Card.Content>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <CartItem item={item} />}
              scrollEnabled={false}
            />
            <Text style={styles.subtotal}>
              합계: {formatNumber(getSubtotal())}원
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* 쿠폰 모달 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}> 쿠폰 적용</Text>
        <Card style={[styles.card, styles.roundedCard]}>
          <Card.Content>
            <Button mode="contained" onPress={() => setCouponModalVisible(true)}>
              쿠폰 선택
            </Button>
            <Divider />
            {hasAvailableCoupons && !selectedCoupon && (
              <Text style={styles.availableCouponText}>
                사용 가능한 쿠폰이 있습니다.
              </Text>
            )}
            {selectedCoupon && (
              <>
                <Text style={styles.selectedCoupon}>
                  적용된 쿠폰: {selectedCoupon.name} (-{formatNumber(
                    getDiscountAmount(getSubtotal(), selectedCoupon)
                  )}
                  원 할인)
                </Text>
                <Button
                  mode="outlined"
                  onPress={cancelCoupon}
                  style={styles.cancelButton}
                  labelStyle={styles.cancelButtonLabel}>
                  쿠폰 적용 취소
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* 포인트 사용 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}> 포인트 사용</Text>
        <Card style={[styles.card, styles.roundedCard]}>
          <Card.Content>
            <Text style={styles.label}>
              보유 포인트: {formatNumber(availablePoints)}점
            </Text>
            <PaperTextInput
              label="사용할 포인트 입력"
              value={pointInput}
              onChangeText={(value) => {
                setPointInput(value);
                applyPoints(value); // 입력 시 자동 적용
              }}
              keyboardType="numeric"
              style={[
                styles.input,
                { backgroundColor: 'white', color: 'black' },
              ]}
            />
            <Button mode="contained" onPress={handleFullPointsUsage}>
              포인트 모두 사용
            </Button>
            <Button
              mode="outlined"
              onPress={cancelPoints}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}>
              포인트 사용 취소
            </Button>
            {usedPoints > 0 && (
              <>
                <Text style={styles.usedPoints}>
                  사용한 포인트: {formatNumber(usedPoints)}원
                </Text>
              </>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* 결제 수단 선택 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}> 결제 수단 선택</Text>
        <Card style={[styles.card, styles.roundedCard]} mode="outlined">
          <Card.Content>
            <FlatList
              data={paymentMethods}
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={({ item }) => (
                <TouchableWithoutFeedback
                  onPress={() => handlePaymentMethodSelect(item)}>
                  <View
                    style={[
                      styles.paymentMethodItem,
                      selectedPaymentMethod?.id === item.id &&
                        styles.selectedPaymentMethodItem,
                    ]}>
                    <Text style={styles.paymentMethodText}>{item.name}</Text>
                    {!['KakaoPay', 'TossPay'].includes(item.type) &&
                      item.isRegistered && (
                        <Text style={styles.registeredText}>등록 완료</Text>
                      )}
                    {!['KakaoPay', 'TossPay'].includes(item.type) &&
                      !item.isRegistered && (
                        <Text style={styles.registerText}>등록 필요</Text>
                      )}
                  </View>
                </TouchableWithoutFeedback>
              )}
            />
          </Card.Content>
        </Card>
      </View>

      {/* 총 결제 금액 */}
      <Card style={[styles.totalCard, { backgroundColor: '#f0f0f0' }]}>
        <Card.Content>
          <Text style={styles.totalText}>
            총 결제 금액: {formatNumber(getTotal())}원
          </Text>
          {selectedCoupon && (
            <Text style={styles.discountText}>
              쿠폰 할인: -{formatNumber(
                getDiscountAmount(getSubtotal(), selectedCoupon)
              )}
              원
            </Text>
          )}
          {usedPoints > 0 && (
            <Text style={styles.discountText}>
              포인트 사용: -{formatNumber(usedPoints)}원
            </Text>
          )}
          <Text style={styles.earnedPointsText}>
            포인트 적립: +{formatNumber(getEarnedPoints())}원
          </Text>
        </Card.Content>
      </Card>

      {/* 결제 버튼 */}
      <Button
        mode="contained"
        onPress={handlePayment}
        style={styles.paymentButtonSmall}>
        결제하기 ({formatNumber(getTotal())}원)
      </Button>

      {/* 모달들 */}
      <Portal>
        <CouponModal
          visible={couponModalVisible}
          onDismiss={() => setCouponModalVisible(false)}
          coupons={coupons} // 사용자 쿠폰을 전달
          getSubtotal={getSubtotal}
          setSelectedCoupon={setSelectedCoupon}
          getDiscountAmount={getDiscountAmount}
        />
        <PaymentMethodModal
          visible={paymentModalVisible}
          onDismiss={() => setPaymentModalVisible(false)}
          selectedPaymentType={selectedPaymentType}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          setPaymentModalVisible={setPaymentModalVisible}
        />
      </Portal>
    </ScrollView>
  );
};

export default Checkout;
