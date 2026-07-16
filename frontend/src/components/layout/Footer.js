import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiFacebook, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-dark-950 text-dark-300 mt-auto">
      <div className="container-app py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-white" style={{ fontFamily: 'Clash Display' }}>
                Shop<span className="text-brand-500">Nest</span>
              </span>
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed mb-5">
              Your one-stop cloud-native e-commerce destination. Quality products, seamless experience.
            </p>
            <div className="flex gap-3">
              {[FiGithub, FiTwitter, FiInstagram, FiFacebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-dark-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              {['All Products', 'Electronics', 'Clothing', 'Home & Living', 'Sports', 'Books'].map((item) => (
                <li key={item}>
                  <Link to={`/products?category=${item.toLowerCase()}`} className="text-sm text-dark-400 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              {[
                { label: 'My Account', to: '/dashboard' },
                { label: 'My Orders', to: '/dashboard?tab=orders' },
                { label: 'Wishlist', to: '/dashboard?tab=wishlist' },
                { label: 'Track Order', to: '/dashboard?tab=orders' },
                { label: 'Sign In', to: '/login' },
                { label: 'Register', to: '/register' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-dark-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-dark-400">
                <FiMapPin size={15} className="mt-0.5 flex-shrink-0" />
                Ludhiana, Punjab, India
              </li>
              <li className="flex items-center gap-3 text-sm text-dark-400">
                <FiPhone size={15} />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-3 text-sm text-dark-400">
                <FiMail size={15} />
                support@shopnest.in
              </li>
            </ul>

            <div className="mt-5 p-4 bg-dark-900 rounded-xl">
              <p className="text-xs text-dark-400 mb-2">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-xs text-white placeholder-dark-500 focus:outline-none focus:border-brand-500"
                />
                <button className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-lg text-xs transition-colors">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-dark-800">
        <div className="container-app py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-dark-500">© 2026 ShopNest. Built by Kunwar Isht Dev Pratap Singh · INT 377</p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-dark-500 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-dark-500 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-dark-500 hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}