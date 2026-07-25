# 🎓 IUH Admission Calculator - Công Cụ Tính Điểm Xét Tuyển Đại Học

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Tech Stack](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)
![Database](https://img.shields.io/badge/Database-MySQL%20(Aiven%20Cloud)-orange)

> **Website hỗ trợ thí sinh tra cứu và tính điểm xét tuyển vào Trường Đại học Công nghiệp TP.HCM (IUH) nhanh chóng, chính xác.**

---

## 🔗 Live Demo

- 🌐 **Website App (Frontend):** [https://iuh-calculation-website.vercel.app](https://iuh-calculation-website.vercel.app)
- ⚙️ **API Service (Backend):** [https://iuh-admission-api.onrender.com](https://iuh-admission-api.onrender.com)

---

## ✨ Tính Năng Chính

* 🎯 **Chọn tổ hợp môn:** Hỗ trợ đầy đủ các tổ hợp xét tuyển phổ biến (A00, A01, B00, D01...).
* 📚 **Tự động lọc ngành:** Chọn tổ hợp sẽ tự động hiển thị các ngành tương ứng từ Database Cloud.
* 📊 **So sánh điểm chuẩn:** Tính tổng điểm xét tuyển và so sánh trực tiếp với điểm chuẩn năm gần nhất.
* ⚡ **Giao diện hiện đại:** Tối ưu trải nghiệm người dùng, tương thích với cả máy tính và điện thoại.

---

## 🛠️ Kiến Trúc Hệ Thống & Công Nghệ Sử Dụng

### **Architecture (Full-stack):**
`Client (Frontend)` ➡️ `API Server (Express/Render)` ➡️ `Cloud Database (MySQL/Aiven)`

### **Technologies:**
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Fetch API
- **Backend:** Node.js, Express.js
- **Database:** MySQL (Hosted on Aiven Cloud)
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## 🚀 Hướng Dẫn Chạy Local (Cho Developer)

### **1. Yêu cầu hệ thống:**
- Node.js (v16 trở lên)
- MySQL Workbench / Server

### **2. Cài đặt Backend:**
```bash
# Clone project
git clone [https://github.com/kaophyy/iuh-admission.git](https://github.com/kaophyy/iuh-admission.git)

# Mở thư mục backend
cd backend

# Cài đặt thư viện
npm install

# Khởi chạy server
npm start
