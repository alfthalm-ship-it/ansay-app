import React, { useState, useEffect } from 'react';
import { Home, ShoppingCart, Settings, ClipboardList, Plus, Edit2, Trash2, MapPin, CheckCircle } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";

// --- KONFIGURASI FIREBASE ANDA ---
const firebaseConfig = {
  apiKey: "AIzaSyB6VxA1Lb8Cf9nhiKabtr8Y8l0ZEb-Y4oE",
  authDomain: "ansay-app.firebaseapp.com",
  projectId: "ansay-app",
  storageBucket: "ansay-app.firebasestorage.app",
  messagingSenderId: "677451977310",
  appId: "1:677451977310:web:6bd18f8d52288de154dacf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// ---------------------------------

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [category, setCategory] = useState('Semua');
  
  // States untuk Admin & Keamanan
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [targetAdminTab, setTargetAdminTab] = useState('');
  
  // States Form Tambah/Edit Produk
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', unit: '', image: '', category: 'Sayuran' });

  // States Checkout
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [customerData, setCustomerData] = useState({ name: '', phone: '', address: '', shipping: 'reguler' });

  const categories = ['Semua', 'Sayuran', 'Ikan', 'Daging', 'Bumbu'];

  // MENGAMBIL DATA DARI FIREBASE (REAL-TIME)
  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
    });

    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, []);

  // FITUR KERANJANG BELANJA
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shippingCost = customerData.shipping === 'hemat' ? 5000 : customerData.shipping === 'instant' ? 25000 : 12000;
  const grandTotal = subTotal + (cart.length > 0 ? shippingCost : 0);

  // FITUR CHECKOUT (SIMPAN KE DATABASE)
  const handleCheckout = async () => {
    if (!customerData.name || !customerData.phone || !customerData.address) {
      setShowAddressModal(true);
      return;
    }
    
    const newOrder = {
      orderId: `#AS-${Math.floor(Math.random() * 10000)}`,
      customer: customerData,
      items: cart,
      subTotal,
      shippingCost,
      grandTotal,
      status: 'Menunggu Konfirmasi',
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'orders'), newOrder);
      setCart([]);
      setShowSuccessModal(true);
      window.scrollTo(0,0);
    } catch (error) {
      alert("Gagal membuat pesanan: " + error.message);
    }
  };

  // FITUR ADMIN (PRODUK)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'products'), {
      name: formData.name,
      price: parseInt(formData.price),
      unit: formData.unit,
      image: formData.image || 'https://via.placeholder.com/150',
      category: formData.category
    });
    setShowAddModal(false);
    setFormData({ name: '', price: '', unit: '', image: '', category: 'Sayuran' });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, 'products', editProduct.id), {
      price: parseInt(formData.price)
    });
    setShowEditModal(false);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  // FITUR PIN ADMIN
  const verifyPin = () => {
    if (pinInput === '123456') {
      setPinVerified(true);
      setShowPinModal(false);
      setActiveTab(targetAdminTab);
      setPinInput('');
    } else {
      alert('PIN Salah!');
    }
  };

  const attemptAccessAdmin = (tab) => {
    if (pinVerified) {
      setActiveTab(tab);
    } else {
      setTargetAdminTab(tab);
      setShowPinModal(true);
    }
  };

  const filteredProducts = category === 'Semua' ? products : products.filter(p => p.category === category);

  return }