"use client";

import { useState, useEffect } from "react";
import CampusMap from "./components/CampusMap";

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  selling_mode: "C2C_STUDENT" | "B2C_OFFICIAL";
  item_condition?: string;
  pickup_location?: string;
  external_link?: string;
  outbound_clicks: number;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"C2C" | "B2C">("C2C");
  const [products, setProducts] = useState<Product[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Modal Auth State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authError, setAuthError] = useState("");

  // Modal Add Product State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCondition, setNewCondition] = useState("มือสอง");
  const [newPickup, setNewPickup] = useState("ตึกพระเทพฯ (HM)");
  const [newMode, setNewMode] = useState<"C2C_STUDENT" | "B2C_OFFICIAL">("C2C_STUDENT");
  const [newLink, setNewLink] = useState("");

  const API_BASE = "http://localhost:8000/api";

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSendOTP = async () => {
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "เกิดข้อผิดพลาด");
      setOtpSent(true);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleVerifyOTP = async () => {
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, code: otpInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "เกิดข้อผิดพลาด");
      
      setUserEmail(data.user.email);
      setShowAuthModal(false);
      setOtpSent(false);
      setEmailInput("");
      setOtpInput("");
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleAddProduct = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          price: parseFloat(newPrice) || 0,
          selling_mode: newMode,
          item_condition: newMode === "C2C_STUDENT" ? newCondition : "มือหนึ่ง",
          pickup_location: newMode === "C2C_STUDENT" ? newPickup : null,
          external_link: newMode === "B2C_OFFICIAL" ? newLink : null,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewTitle("");
        setNewDesc("");
        setNewPrice("");
        setNewLink("");
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOutboundClick = async (productId: number, link?: string) => {
    try {
      await fetch(`${API_BASE}/products/${productId}/click`, { method: "POST" });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
    if (link) window.open(link, "_blank");
  };

  const filteredProducts = products.filter((p) =>
    activeTab === "C2C" ? p.selling_mode === "C2C_STUDENT" : p.selling_mode === "B2C_OFFICIAL"
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-orange-600 text-white p-4 shadow-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide">KMITL Marketplace</h1>
          <div className="flex items-center gap-3">
            {userEmail && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-lg text-sm transition-colors shadow-sm"
              >
                + ลงขายสินค้า
              </button>
            )}
            {userEmail ? (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-orange-700 px-3 py-1.5 rounded-full border border-orange-500 font-medium">
                  👤 {userEmail}
                </span>
                <button
                  onClick={() => setUserEmail(null)}
                  className="text-xs bg-red-700 px-2.5 py-1 rounded hover:bg-red-800"
                >
                  ออก
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-white text-orange-600 font-semibold px-4 py-1.5 rounded-lg text-sm hover:bg-orange-50 transition-colors shadow-sm"
              >
                🔒 เข้าสู่ระบบ (@kmitl.ac.th)
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6">
        {/* Mode Switcher */}
        <div className="flex justify-center mb-6 bg-gray-200 p-1.5 rounded-xl max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("C2C")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "C2C" ? "bg-white text-orange-600 shadow-sm" : "text-gray-600"
            }`}
          >
            🤝 ตลาดนักศึกษา (นัดรับในมอ)
          </button>
          <button
            onClick={() => setActiveTab("B2C")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === "B2C" ? "bg-orange-600 text-white shadow-sm" : "text-gray-600"
            }`}
          >
            🛍️ ร้านค้า Official (สั่งออนไลน์)
          </button>
        </div>

        {/* Campus Pickup Map Preview */}
        {activeTab === "C2C" && (
          <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="font-bold text-gray-800 text-md">📍 แผนที่จุดนัดรับสินค้ายอดฮิตภายใน สจล.</h2>
            <CampusMap />
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{product.title}</h3>
                  <span className="font-bold text-orange-600 text-lg">฿{product.price}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>

                <div className="flex flex-wrap gap-2 text-xs mb-4">
                  {product.item_condition && (
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
                      {product.item_condition}
                    </span>
                  )}
                  {product.pickup_location && (
                    <span className="bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-md border border-emerald-200">
                      📍 นัดรับ: {product.pickup_location}
                    </span>
                  )}
                  {product.selling_mode === "B2C_OFFICIAL" && (
                    <span className="bg-orange-50 text-orange-700 font-medium px-2.5 py-1 rounded-md border border-orange-200">
                      📊 ยอดคลิก: {product.outbound_clicks} ครั้ง
                    </span>
                  )}
                </div>
              </div>

              {product.selling_mode === "C2C_STUDENT" ? (
                <button
                  onClick={() => alert("ระบบกำลังเชื่อมต่อไปยังแชทนัดรับ...")}
                  className="w-full bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 text-sm"
                >
                  💬 แชทนัดรับสินค้าในมอ
                </button>
              ) : (
                <button
                  onClick={() => handleOutboundClick(product.id, product.external_link)}
                  className="w-full bg-orange-600 text-white font-medium py-2.5 rounded-lg hover:bg-orange-700 text-sm"
                >
                  🔗 ไปยังหน้าชำระเงินหลัก (External Link)
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Auth Modal (Email OTP) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-xl font-bold mb-2">เข้าสู่ระบบ สจล.</h2>
            <p className="text-xs text-gray-500 mb-4">
              กรอกอีเมลสถาบันเพื่อรับรหัส OTP ยืนยันตัวตน
            </p>

            {authError && (
              <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-lg mb-3">
                {authError}
              </div>
            )}

            {!otpSent ? (
              <div>
                <input
                  type="email"
                  placeholder="student_id@kmitl.ac.th"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm mb-3 focus:outline-orange-500"
                />
                <button
                  onClick={handleSendOTP}
                  className="w-full bg-orange-600 text-white font-medium py-2.5 rounded-lg text-sm hover:bg-orange-700"
                >
                  ขอรหัส OTP
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="รหัส OTP 6 หลัก"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm mb-3 text-center tracking-widest font-bold focus:outline-orange-500"
                />
                <button
                  onClick={handleVerifyOTP}
                  className="w-full bg-emerald-600 text-white font-medium py-2.5 rounded-lg text-sm hover:bg-emerald-700 mb-2"
                >
                  ยืนยันการเข้าสู่ระบบ
                </button>
                <button
                  onClick={() => setOtpSent(false)}
                  className="w-full text-xs text-gray-500 py-1"
                >
                  ย้อนกลับ
                </button>
              </div>
            )}

            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-3 w-full text-xs text-gray-400 py-1"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4">ลงประกาศขายสินค้า</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold">โหมดการขาย</label>
                <select
                  value={newMode}
                  onChange={(e: any) => setNewMode(e.target.value)}
                  className="w-full border p-2 rounded-lg text-sm"
                >
                  <option value="C2C_STUDENT">🤝 ตลาดนักศึกษา (นัดรับในมอ)</option>
                  <option value="B2C_OFFICIAL">🛍️ ร้านค้า Official (สั่งออนไลน์)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold">ชื่อสินค้า</label>
                <input
                  type="text"
                  placeholder="เช่น หนังสือฟิสิกส์ 1"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">รายละเอียด</label>
                <textarea
                  placeholder="รายละเอียดสินค้า..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">ราคา (บาท)</label>
                <input
                  type="number"
                  placeholder="150"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full border p-2 rounded-lg text-sm"
                />
              </div>

              {newMode === "C2C_STUDENT" ? (
                <>
                  <div>
                    <label className="text-xs font-semibold">สภาพสินค้า</label>
                    <input
                      type="text"
                      placeholder="เช่น มือสอง (สภาพดีมาก)"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      className="w-full border p-2 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">จุดนัดรับในมอ</label>
                    <select
                      value={newPickup}
                      onChange={(e) => setNewPickup(e.target.value)}
                      className="w-full border p-2 rounded-lg text-sm"
                    >
                      <option value="ตึกพระเทพฯ (HM)">ตึกพระเทพฯ (HM)</option>
                      <option value="โรงอาหาร C1">โรงอาหาร C1</option>
                      <option value="หอประชุมใหญ่ สจล.">หอประชุมใหญ่ สจล.</option>
                      <option value="คณะสถาปัตย์">คณะสถาปัตย์</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-semibold">External Link (Shopee/Line/Web)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    className="w-full border p-2 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={handleAddProduct}
                className="flex-1 bg-orange-600 text-white font-semibold py-2 rounded-lg text-sm hover:bg-orange-700"
              >
                บันทึกประกาศ
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 border rounded-lg text-sm text-gray-500"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}