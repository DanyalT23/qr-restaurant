"use client";
import React from 'react';
import Loader from '@/components/Loader';
import WelcomeView from '@/components/WelcomeView';
import MenuView from '@/components/MenuView';
import BillView from '@/components/BillView';
import SuccessView from '@/components/SuccessView';
import FloatingCart from '@/components/FloatingCart';
import CartModal from '@/components/CartModal';
import CheckoutModal from '@/components/CheckoutModal';
import ToastContainer from '@/components/ToastContainer';

export default function Home() {
  return (
    <div id="app">
      <Loader />
      <WelcomeView />
      <MenuView />
      <BillView />
      <SuccessView />
      
      <FloatingCart />
      <CartModal />
      <CheckoutModal />
      
      <ToastContainer />
    </div>
  );
}
