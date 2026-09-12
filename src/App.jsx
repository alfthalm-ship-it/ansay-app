import React, { useState, useEffect } from 'react';
import { Home, ShoppingBag, ListOrdered, Settings, Plus, Search, X, LogOut, Edit2, Trash2, Camera, CheckCircle2, MapPin, User, Phone } from 'lucide-react';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Bayam Segar', price: 5000, unit: 'Ikat', category: 'Sayuran', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 2, name: 'Wortel Brastagi', price: 12000, unit: '500g', category: 'Sayuran', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 3, name: 'Ikan Nila Merah', price: 35000, unit: '1kg', category: 'Ikan', image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 4, name: 'Daging Ayam Paha', price: 28000, unit: '500g', category: 'Daging', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 5, name: 'Bawang Merah', price: 15000, unit: '250g', category: 'Bumbu', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=300&h=300' },
  { id: 6, name: 'Tomat Cherry', price: 18000, unit: '250g', category: 'Sayuran', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300&h=300' },
];

const CATEGORIES = ['Semua', 'Sayuran', 'Ikan', 'Daging', 'Bumbu'];

const SHIPPING_OPTIONS = [
  { id: 'hemat', label: 'Hemat (2-3 Hari)', price: 10000 },
  { id: 'reguler', label: 'Reguler (1 Hari)', price: 15000 },
  { id: 'instant', label: 'Instant (Hari ini)', price: 25000 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]); // Simulasi Database Pesanan
  
  // User & Checkout State
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_OPTIONS[1]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [tempName, setTempName] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [tempAddress, setTempAddress] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // Security (Admin) State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinTarget, setPinTarget] = useState('');
  const [pinInput, setPinInput] = useState('');

  // Admin Catalog State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditPriceModal, setShowEditPriceModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', unit: '', category: 'Sayuran', image: '' });

  const filteredProducts = products.filter(p => 
    (activeCategory === 'Semua' || p.category === activeCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const grandTotal = cartTotal + shippingMethod.price;
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleTabChange = (tab) => {
    if ((tab === 'orders' || tab === 'admin') && !isAuthenticated) {
      setPinTarget(tab);
      setShowPinModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handlePinSubmit = () => {
    if (pinInput === '123456') {
      setIsAuthenticated(true);
      setShowPinModal(false);
      setPinInput('');
      setActiveTab(pinTarget);
    } else {
      alert('PIN Salah! (Petunjuk: 123456)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Validasi kelengkapan data kontak
    if (!userName.trim() || !userPhone.trim() || !userAddress.trim()) {
      setTempName(userName);
      setTempPhone(userPhone);
      setTempAddress(userAddress);
      setShowAddressModal(true);
      return;
    }

    const newOrderId = `AS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: newOrderId,
      date: new Date().toLocaleString('id-ID'),
      items: cart,
      shipping: shippingMethod,
      userName: userName,
      userPhone: userPhone,
      userAddress: userAddress,
      total: grandTotal,
      status: 'Menunggu Konfirmasi'
    };

    // Simpan ke 'Database'
    setOrders([newOrder, ...orders]);
    setLastOrder(newOrder);
    setOrderSuccess(true);
  };

  const completeOrder = () => {
    setCart([]);
    setOrderSuccess(false);
    setActiveTab('home');
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.unit || !newProduct.image) return;
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts([...products, { ...newProduct, id: newId, price: parseInt(newProduct.price) }]);
    setShowAddModal(false);
    setNewProduct({ name: '', price: '', unit: '', category: 'Sayuran', image: '' });
  };

  const handleDeleteProduct = (id) => {
    if(window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setProducts(products.filter(p => p.id !== id));
      // Hapus dari keranjang juga jika ada
      setCart(cart.filter(item => item.id !== id));
    }
  };

  const handleUpdatePrice = () => {
    if (!editingProduct || !editingProduct.price) return;
    setProducts(products.map(p => 
      p.id === editingProduct.id ? { ...p, price: parseInt(editingProduct.price) } : p
    ));
    setShowEditPriceModal(false);
    setEditingProduct(null);
  };

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit && editingProduct) {
          setEditingProduct({ ...editingProduct, image: reader.result });
        } else {
          setNewProduct({ ...newProduct, image: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex justify-center">
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl flex flex-col overflow-x-hidden">
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold tracking-tight text-green-700">AnSay<span className="text-xl">🥬</span></h1>
            <button 
              onClick={() => {
                setTempName(userName);
                setTempPhone(userPhone);
                setTempAddress(userAddress);
                setShowAddressModal(true);
              }}
              className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 border border-green-200 transition p-1.5 px-3 rounded-full cursor-pointer"
            >
              <User size={14} className="text-green-700" />
              <span className="text-xs font-semibold text-green-700 max-w-[90px] truncate">
                {userName ? userName : 'Atur Kontak'}
              </span>
            </button>
          </div>
          
          {activeTab === 'home' && (
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari sayur, ikan, daging..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24">
          
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="p-4 animate-in fade-in duration-300">
              {/* Category Pills */}
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 mb-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat ? 'bg-green-600 text-white shadow-md shadow-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {filteredProducts.map(product => {
                  const cartItem = cart.find(item => item.id === product.id);
                  return (
                    <div key={product.id} className="bg-white border border-gray-100 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition flex flex-col h-full">
                      <div className="aspect-square rounded-xl bg-gray-50 mb-3 overflow-hidden relative">
                         <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-semibold text-sm leading-tight text-gray-800 mb-1 line-clamp-2">{product.name}</h3>
                        <p className="text-gray-500 text-xs mb-2">{product.unit}</p>
                        <div className="mt-auto">
                          <p className="font-bold text-green-600 text-sm mb-3">Rp {product.price.toLocaleString('id-ID')}</p>
                          {cartItem ? (
                            <div className="flex items-center justify-between bg-green-50 rounded-xl p-1 border border-green-100">
                              <button onClick={() => updateQuantity(product.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-green-700 font-bold">-</button>
                              <span className="font-bold text-sm text-green-800">{cartItem.quantity}</span>
                              <button onClick={() => updateQuantity(product.id, 1)} className="w-7 h-7 flex items-center justify-center bg-green-600 rounded-lg shadow-sm text-white font-bold">+</button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(product)} className="w-full bg-white border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-1.5 rounded-xl text-sm transition">
                              Tambah
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-10 text-gray-500">Produk tidak ditemukan.</div>
              )}
            </div>
          )}

          {/* CART TAB */}
          {activeTab === 'cart' && (
            <div className="p-4 animate-in fade-in duration-300">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                Keranjang Belanja <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{totalCartItems}</span>
              </h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500">Keranjang masih kosong</p>
                  <button onClick={() => setActiveTab('home')} className="mt-4 text-green-600 font-semibold">Belanja Sekarang</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-3 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm text-gray-800 leading-tight">{item.name}</h3>
                          <p className="text-gray-500 text-xs mb-1">{item.unit}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-bold text-sm text-green-600">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                              <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600">-</button>
                              <span className="font-semibold text-xs min-w-[12px] text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Options */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Opsi Pengiriman</h3>
                    <div className="space-y-2">
                      {SHIPPING_OPTIONS.map(option => (
                        <label key={option.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${shippingMethod.id === option.id ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name="shipping" 
                              checked={shippingMethod.id === option.id}
                              onChange={() => setShippingMethod(option)}
                              className="text-green-600 focus:ring-green-500 w-4 h-4"
                            />
                            <span className="text-sm font-medium">{option.label}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-700">Rp {option.price.toLocaleString('id-ID')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal Produk</span>
                      <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 pb-2 border-b border-gray-200">
                      <span>Ongkos Kirim</span>
                      <span>Rp {shippingMethod.price.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-1">
                      <span>Total</span>
                      <span className="text-green-700">Rp {grandTotal.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Delivery Warning */}
                  {(!userName || !userPhone || !userAddress) && (
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex gap-2 items-start">
                      <MapPin size={16} className="text-orange-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-orange-800">Anda belum mengatur kontak dan alamat pengiriman. Sistem akan memintanya saat Checkout.</p>
                    </div>
                  )}

                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-200 transition-transform active:scale-[0.98]"
                  >
                    Pesan Sekarang (Rp {grandTotal.toLocaleString('id-ID')})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB (ADMIN) */}
          {activeTab === 'orders' && (
            <div className="p-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Daftar Pesanan</h2>
                <button onClick={handleLogout} className="text-xs flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                  <LogOut size={12} /> Keluar
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Belum ada pesanan masuk.</div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                        <div>
                          <span className="font-bold text-sm">{order.id}</span>
                          <span className="block text-xs text-gray-500">{order.date}</span>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded-md">
                          {order.status}
                        </span>
                      </div>
                      
                      {/* Customer Info */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                          <User size={12} className="text-gray-400" /> {order.userName}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-gray-700">
                          <Phone size={12} className="text-gray-400" /> {order.userPhone}
                        </div>
                        <div className="flex items-start gap-1.5 text-gray-600">
                          <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{order.userAddress}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-3">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-xs">
                            <span className="text-gray-600">{item.quantity}x {item.name}</span>
                            <span className="font-medium">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs text-gray-500 border-t border-gray-50 pt-1">
                          <span>Ongkir ({order.shipping.label.split(' ')[0]})</span>
                          <span>Rp {order.shipping.price.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-xs font-semibold text-gray-500">Total Belanja</span>
                        <span className="font-bold text-green-700 text-sm">Rp {order.total.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADMIN CATALOG TAB */}
          {activeTab === 'admin' && (
            <div className="p-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Kelola Katalog</h2>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
                    <Plus size={16} /> Tambah
                  </button>
                  <button onClick={handleLogout} className="bg-red-50 text-red-500 p-1.5 rounded-lg">
                    <LogOut size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {products.map(product => (
                  <div key={product.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.unit} • {product.category}</p>
                      <p className="font-bold text-green-600 text-sm">Rp {product.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button 
                        onClick={() => { setEditingProduct(product); setShowEditPriceModal(true); }}
                        className="p-1.5 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center pb-safe z-40">
          <button onClick={() => handleTabChange('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-green-600' : 'text-gray-400'}`}>
            <Home size={22} className={activeTab === 'home' ? 'fill-current' : ''} />
            <span className="text-[10px] font-medium">Beranda</span>
          </button>
          <button onClick={() => handleTabChange('cart')} className={`flex flex-col items-center gap-1 relative ${activeTab === 'cart' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className="relative">
              <ShoppingBag size={22} className={activeTab === 'cart' ? 'fill-current' : ''} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {totalCartItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Keranjang</span>
          </button>
          <button onClick={() => handleTabChange('orders')} className={`flex flex-col items-center gap-1 ${activeTab === 'orders' ? 'text-green-600' : 'text-gray-400'}`}>
            <ListOrdered size={22} />
            <span className="text-[10px] font-medium">Pesanan</span>
          </button>
          <button onClick={() => handleTabChange('admin')} className={`flex flex-col items-center gap-1 ${activeTab === 'admin' ? 'text-green-600' : 'text-gray-400'}`}>
            <Settings size={22} />
            <span className="text-[10px] font-medium">Admin</span>
          </button>
        </nav>

        {/* Address & Contact Input Modal */}
        {showAddressModal && (
          <div className="absolute inset-0 bg-gray-900/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[340px] rounded-2xl p-5 shadow-xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-lg">Detail Kontak & Pengiriman</h3>
                <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama Penerima</label>
                  <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Contoh: Budi Santoso" className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nomor HP / WhatsApp</label>
                  <input type="tel" value={tempPhone} onChange={(e) => setTempPhone(e.target.value)} placeholder="Contoh: 08123456789" className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Alamat Lengkap</label>
                  <textarea
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    placeholder="Masukkan alamat lengkap (Jalan, RT/RW, Patokan)..."
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                  ></textarea>
                </div>
              </div>
              <button
                onClick={() => {
                  setUserName(tempName);
                  setUserPhone(tempPhone);
                  setUserAddress(tempAddress);
                  setShowAddressModal(false);
                  
                  // Jika dipanggil dari cart tapi belum tersimpan, kita bisa auto-checkout (opsional). 
                  // Di sini cukup simpan saja agar flow aman.
                }}
                disabled={!tempAddress.trim() || !tempName.trim() || !tempPhone.trim()}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
              >
                Simpan & Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* PIN Security Modal */}
        {showPinModal && (
          <div className="absolute inset-0 bg-gray-900/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-[280px] rounded-2xl p-5 shadow-xl animate-in zoom-in-95 duration-200 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-600">
                <Settings size={24} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">Akses Admin</h3>
              <p className="text-xs text-gray-500 mb-4">Masukkan PIN rahasia untuk melanjutkan.</p>
              
              <input 
                type="password" 
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••" 
                className="w-full border border-gray-300 rounded-xl p-3 text-center tracking-[0.5em] font-mono text-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              
              <div className="flex gap-2">
                <button onClick={() => {setShowPinModal(false); setPinInput('');}} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-sm">Batal</button>
                <button onClick={handlePinSubmit} className="flex-1 bg-green-600 text-white font-semibold py-2.5 rounded-xl text-sm">Masuk</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="absolute inset-0 bg-gray-900/60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[320px] rounded-2xl p-5 shadow-xl animate-in zoom-in-95">
              <h3 className="font-bold text-gray-800 text-lg mb-4">Tambah Produk</h3>
              <div className="space-y-3">
                {/* Image Upload Area */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative">
                    {newProduct.image ? (
                      <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} className="text-gray-400" />
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  </div>
                  <span className="text-[10px] text-gray-500">Tap untuk upload foto</span>
                </div>
                
                <input type="text" placeholder="Nama Produk (Cth: Brokoli)" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm" />
                <div className="flex gap-2">
                  <input type="number" placeholder="Harga" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm" />
                  <input type="text" placeholder="Unit (Cth: 1kg)" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} className="w-1/3 border border-gray-300 rounded-xl p-2.5 text-sm" />
                </div>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm bg-white">
                  {CATEGORIES.filter(c => c !== 'Semua').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-sm">Batal</button>
                <button onClick={handleAddProduct} className="flex-1 bg-green-600 text-white font-semibold py-2.5 rounded-xl text-sm">Simpan</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Price Modal */}
        {showEditPriceModal && editingProduct && (
          <div className="absolute inset-0 bg-gray-900/60 z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-[280px] rounded-2xl p-5 shadow-xl animate-in zoom-in-95">
              <h3 className="font-bold text-gray-800 mb-1">Ubah Harga</h3>
              <p className="text-sm text-gray-500 mb-4">{editingProduct.name}</p>
              
              <input 
                type="number" 
                value={editingProduct.price} 
                onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                className="w-full border border-gray-300 rounded-xl p-3 text-lg font-bold text-green-700 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" 
              />
              
              <div className="flex gap-2">
                <button onClick={() => {setShowEditPriceModal(false); setEditingProduct(null)}} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 rounded-xl text-sm">Batal</button>
                <button onClick={handleUpdatePrice} className="flex-1 bg-orange-500 text-white font-semibold py-2.5 rounded-xl text-sm">Update</button>
              </div>
            </div>
          </div>
        )}

        {/* Order Success Screen */}
        {orderSuccess && lastOrder && (
          <div className="absolute inset-0 bg-white z-[70] flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom-4">
            <CheckCircle2 size={64} className="text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h2>
            <p className="text-gray-500 text-center text-sm mb-6 max-w-[260px]">
              Pesanan Anda dengan ID <span className="font-bold text-gray-700">{lastOrder.id}</span> telah masuk ke sistem kami.
            </p>
            
            <div className="bg-gray-50 w-full rounded-2xl p-4 mb-8">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-500">Pengiriman</span>
                <span className="font-bold text-gray-800">{lastOrder.shipping.label.split(' ')[0]}</span>
              </div>
              <div className="flex flex-col text-sm border-t border-gray-200 pt-3">
                <span className="text-gray-500 mb-1">Kontak & Alamat</span>
                <span className="font-bold text-gray-800 text-sm">{lastOrder.userName}</span>
                <span className="text-gray-600 text-xs mb-1">{lastOrder.userPhone}</span>
                <span className="font-medium text-gray-700 text-xs leading-relaxed">{lastOrder.userAddress}</span>
              </div>
            </div>

            <button 
              onClick={completeOrder}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg transition"
            >
              Selesai & Kembali Belanja
            </button>
          </div>
        )}

      </div>
    </div>
  );
}