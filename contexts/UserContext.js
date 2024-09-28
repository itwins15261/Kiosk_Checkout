// contexts/UserContext.js

import React, { createContext, useState } from 'react';

// 초기 사용자 데이터: 포인트, 쿠폰, 결제 수단
const initialUserData = {
  points: 5000, // 처음 가입 시 지급되는 포인트
  coupons: [    // 처음 가입 시 지급되는 쿠폰 2개
    {
      id: 'c1',
      name: '10,000원 이상 3,000원 할인',
      discount: 3000, // 고정 할인 금액
      minAmount: 10000, // 사용할 수 있는 최소 주문 금액
      used: false, // 쿠폰 사용 여부
    },
    {
      id: 'c2',
      name: '20,000원 이상 50% 할인',
      discountRate: 0.5, // 비율로 할인되는 쿠폰
      minAmount: 20000, // 사용할 수 있는 최소 주문 금액
      used: false, // 쿠폰 사용 여부
    },
  ],
  paymentMethods: [
    { id: '1', type: 'Card', name: '카드', isRegistered: false },
    { id: '2', type: 'Account', name: '계좌', isRegistered: false },
    { id: '3', type: 'KakaoPay', name: '카카오페이', isRegistered: true },
    { id: '4', type: 'TossPay', name: '토스페이', isRegistered: true },
  ], // 결제 수단 목록
};

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [points, setPoints] = useState(initialUserData.points);
  const [coupons, setCoupons] = useState(initialUserData.coupons);
  const [paymentMethods, setPaymentMethods] = useState(
    initialUserData.paymentMethods
  );

  // 포인트 업데이트 함수
  const updatePoints = (newPoints) => {
    setPoints(newPoints);
  };

  // 쿠폰 사용 처리 함수
  const markCouponAsUsed = (couponId) => {
    setCoupons((prevCoupons) =>
      prevCoupons.map((coupon) =>
        coupon.id === couponId ? { ...coupon, used: true } : coupon
      )
    );
  };

  // 포인트 추가 함수 (적립)
  const addPoints = (earnedPoints) => {
    setPoints((prevPoints) => prevPoints + earnedPoints);
  };

  // 결제 수단 등록 함수
  const addPaymentMethod = (method) => {
    setPaymentMethods((prevMethods) =>
      prevMethods.map((m) =>
        m.type === method.type ? { ...m, isRegistered: true, ...method } : m
      )
    );
  };

  // 컨텍스트에서 제공할 값들
  const value = {
    points,
    coupons,
    paymentMethods,
    updatePoints,
    markCouponAsUsed,
    addPoints,
    addPaymentMethod,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
