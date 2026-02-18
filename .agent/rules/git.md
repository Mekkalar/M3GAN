---
trigger: manual
---

# Git Lab Collaboration Workflow

> **Concept:** "Clean Code, Clear Process."
> ระบบการทำงานร่วมกันที่เน้นระเบียบวินัย Code ต้องสะอาดก่อนส่ง และต้องผ่านตา PM ก่อนเข้า Branch หลักเสมอ

## 1. Branching Strategy (โครงสร้าง Branch)

เราจะใช้โครงสร้างที่ชัดเจน ห้ามแตก Branch มั่ว และห้าม Push ตรงเข้า Main Branch เด็ดขาด

### 1.1 Protected Branches (ห้ามแก้โดยตรง)
- **`design-systems`**:
  - **เก็บอะไร:** Code ของ Design System, UI Components กลาง, Global Styles
  - **ใครแก้ได้:** เฉพาะทีม UI/UX Engineer หรือได้รับมอบหมายพิเศษ
  - **กฎ:** ห้าม Merge งาน Logic ทั่วไปเข้ามาปนเปื้อน

- **`develop-[Version]`** (เช่น `develop-v1.0`, `develop-v1.1`):
  - **เก็บอะไร:** Source Code หลักของพัฒนาการใน Version นั้นๆ
  - **ใครแก้ได้:** ไม่มีใครแก้ได้โดยตรง! ต้องผ่าน **Merge Request (MR)** เท่านั้น

### 1.2 Working Branches (พื้นที่ทำงาน)
- **`feature/[ticket-id]-[name]`**:
  - **ใช้เมื่อ:** เริ่มทำ Feature ใหม่ทุกครั้ง ห้ามทำหลาย Feature ใน Branch เดียว
  - **Naming Pattern:**
    - `feature/TICKET-101-login-screen`
    - `feature/TICKET-102-payment-gateway`
  - **Lifecycle:** สร้างจาก `develop` -> ทำงาน -> Merge กลับ `develop` -> **ลบทิ้งทันที**

---

## 2. Quality Gates (ก่อน Commit/Push)

ก่อนที่จะ Code จะออกจากเครื่องเรา ต้องมั่นใจว่า "สะอาด" และ "ไม่พัง"

### 2.1 Local Pre-Commit Hook
ต้องตั้งค่า Script (เช่นใช้ Husky) ให้รันอัตโนมัติก่อน Commit ถ้าไม่ผ่าน ห้าม Commit!
1.  **Linter:** ตรวจ Style Code (ESLint, Prettier)
2.  **Build:** ลอง Run Build ดูว่าผ่านไหม (ป้องกัน Syntax Error หลุดไป)

```bash
# ตัวอย่างสิ่งที่ระบบต้องรันเองอัตโนมัติ
npm run lint
npm run build
# ถ้า Error บรรทัดนี้จะหยุด Commit ทันที
```

### 2.2 Conventional Commits
เขียน Commit message ให้เป็นมาตรฐาน อ่านแล้วรู้เลยว่าแก้ไฟล์ไหน ทำอะไร

- **feat:** เพิ่มฟีเจอร์ใหม่ (e.g., `feat: add user login page`)
- **fix:** แก้บั๊ก (e.g., `fix: correct button color on hover`)
- **refactor:** แก้โค้ดแต่ไม่เปลี่ยนพฤติกรรม (e.g., `refactor: split long function`)
- **docs:** แก้เอกสาร (e.g., `docs: update readme`)

---

## 3. Merge Request (MR) Process

ขั้นตอนการส่งงานเข้าสู่ Branch หลัก (`develop-[Version]`)

### Step 1: Open Merge Request (MR)
เมื่อทำ Feature เสร็จ ให้เปิด MR ไปยัง `develop-[Version]`
**MR Template ที่ต้องระบุ:**
1.  **Objective:** ทำอะไร เพื่ออะไร (ref Ticket ID)
2.  **Changes:** แก้ไขไฟล์ไหนบ้าง กระทบส่วนไหน
3.  **Evidence:** รูปภาพหน้าจอ (Screenshot) หรือ Video ว่ารันได้จริง
4.  **Testing:** ทดสอบยังไงมาแล้วบ้าง

### Step 2: Code Review & Approval
- **ผู้ตรวจ (Approver):** **PM (Project Manager)** หรือ Tech Lead ที่ได้รับมอบหมาย
- **หน้าที่ PM:**
  1.  อ่าน MR Description ว่าครบถ้วนไหม
  2.  ดู Code Changes ว่าเขียนรู้เรื่องไหม มี Logic แปลกๆ ไหม
  3.  **Approve:** กดปุ่ม Approve เพื่อยืนยันให้ผ่าน
  4.  **Merge:** กด Merge เข้า Branch หลัก (PM เป็นคนกดเท่านั้น)

> **Rule:** ถ้า PM ยังไม่ Approve ห้าม Merge เองเด็ดขาด!

---

## 4. Definition of Done (DoD) สำหรับ 1 Feature
- [ ] Code ผ่าน Linter และ Build ผ่านในเครื่องตัวเอง (Pre-commit)
- [ ] **ไม่มี console.log หรือ debug code หลุดมา**
- [ ] Commit Message ถูกต้องตาม Format
- [ ] สร้าง MR พร้อม Description และ Screenshot ครบถ้วน
- [ ] ไม่มี Conflict กับ Branch หลัก
- [ ] ได้รับการ Approve และ Merge โดย PM