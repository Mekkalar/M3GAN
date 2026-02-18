---
trigger: manual
---

# Security & Authentication Guideline

> **Protocol:** "Safety First."
> ความปลอดภัยไม่ใช่ Feature แต่เป็นพื้นฐาน มาตรฐานการจัดการ Authentication และ Authorization

---

## 1. Authentication (การยืนยันตัวตน)
เราใช้มาตรฐาน **JWT (JSON Web Token)** ในการทำ Stateless Authentication

### 1.1 Token Strategy
- **Access Token:**
  - อายุสั้น (เช่น 15-60 นาที)
  - ใช้แนบไปกับ Header `Authorization: Bearer <token>`
- **Refresh Token:**
  - อายุยาว (เช่น 7-30 วัน)
  - เก็บใน **HttpOnly Cookie** (เพื่อกัน XSS Script ขโมย) หรือ Secure Storage บน Mobile
  - ใช้สำหรับขอ Access Token ใหม่เมื่อตัวเก่าหมดอายุ

### 1.2 Login Flow
1. Client ส่ง Username/Password
2. Server ตรวจสอบ -> คืนค่า Access Token (Body) + Refresh Token (Cookie/Body)
3. Client เก็บ Access Token ใน Memory (Variable State) ไม่ใช่ LocalStorage (ถ้าซีเรียสเรื่องความปลอดภัยสูง)

---

## 2. Authorization (สิทธิ์การเข้าถึง)
ใช้โมเดล **RBAC (Role-Based Access Control)**

### 2.1 Role Definition
- **Super Admin:** ทำได้ทุกอย่าง (เข้าถึง Sensitive Data ได้)
- **Admin:** จัดการ Users, Content ได้
- **User:** จัดการข้อมูลตัวเองได้เท่านั้น
- **Viewer:** ดูได้อย่างเดียว

### 2.2 Decorator/Guard Implementation
ใน Code ต้องมี Guard ที่ชัดเจน ห้ามเช็ค `if (user.role == 'admin')` กระจายไปทั่ว
*Good Example (NestJS style):*
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post('create-user')
create() { ... }
```

---

## 3. Common Security Practices (OWASP)

### 3.1 Input Validation
- เชื่อใจใครไม่ได้! Validate Input ทุก field ที่เข้ามาจาก Client
- ใช้ Library เช่น Zod, Joi, class-validator

### 3.2 SQL Injection Prevention
- ห้ามต่อ String SQL เองเด็ดขาด (`"SELECT * FROM users WHERE name = '" + name + "'"` -> ❌ ตายแน่)
- ต้องใช้ **ORM** หรือ **Parameterized Queries** เท่านั้น

### 3.3 Rate Limiting
- ป้องกันการยิง API รัวๆ (Brute Force / DDoS)
- จำกัดจำนวน Request ต่อ IP (เช่น 100 req / minute)

### 3.4 CORS (Cross-Origin Resource Sharing)
- Config CORS ให้รับ Request เฉพาะ Domain ของเราเท่านั้น (ใน Prod ห้าม `Allow *`)

---

## 4. Secrets Management
- **ห้าม** Hardcode Key/Password ใน Code เด็ดขาด
- ใช้ `.env` ไฟล์ และอย่า Commit `.env` เข้า Git
- ใน Prod ใช้ Secrets Manager ของ Cloud Provider (AWS Secrets Manager, Vault)

---

## 5. Network Sniffing Protection (Payload Encryption)
ป้องกันคนแอบดูข้อมูลผ่าน Network Tab (Chrome DevTools) หรือ Wi-Fi Sniffing

### 5.1 HTTPS vs Payload Encryption
*   **HTTPS (TLS):** กันคนกลาง (Man-in-the-Middle) ได้ แต่ **กันคนนั่งหน้าคอมไม่ได้** (เปิด F12 ดู Network ก็เห็นหมด)
*   **Payload Encryption (E2EE):** กันได้หมด แม้แต่คนนั่งหน้าคอมก็เห็นเป็น code มั่วๆ

### 5.2 Hash vs Encrypt (ต้องใช้ให้ถูก)
*   **Hash (SHA-256, bcrypt):**
    *   *คุณสมบัติ:* แปลงแล้วย้อนกลับไม่ได้
    *   *ใช้สำหรับ:* **Password** เท่านั้น (ส่งไป Server แล้วเทียบว่า Hash ตรงกันไหม)
*   **Encryption (AES, RSA):**
    *   *คุณสมบัติ:* แปลงแล้วถอดรหัสออกมาดูข้อมูลเดิมได้ (ถ้ามี Key)
    *   *ใช้สำหรับ:* **Data สำคัญ** เช่น เลขบัตรประชาชน, จำนวนเงิน, ข้อมูลส่วนตัว

### 5.3 Implementation Standard (High Security Only)
ใช้สำหรับ API ที่ Sensitive จริงๆ เท่านั้น (เช่น Login, Payment) เพราะกิน CPU
1.  **Frontend:** ใช้ Public Key ของ Server เพื่อ Encrypt Data (RSA/AES) -> ส่งไปเป็น Payload มั่วๆ
2.  **Network Tab:** จะเห็น Body เป็น `{"payload": "a1b2c3d4..."}` (อ่านไม่ออก)
3.  **Backend:** ใช้ Private Key ถอดรหัสออกมาใช้งาน
