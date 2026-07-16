import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from '../cart/CartSidebar';
import { useSelector } from 'react-redux';
import { selectCartOpen } from '../../store/slices/cartSlice';

export default function Layout() {
  const cartOpen = useSelector(selectCartOpen);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
      {cartOpen && <div className="overlay" onClick={() => {}} />}
    </div>
  );
}