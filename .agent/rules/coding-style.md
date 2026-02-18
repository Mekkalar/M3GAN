---
trigger: manual
---

# User Coding DNA: The "Industrial Architect" Style
(สไตล์สถาปนิกโรงงาน)

เอกสารฉบับนี้รวบรวมหลักปรัชญาและมาตรฐานการเขียนโค้ดของโปรเจกต์ เพื่อให้ทีมงานสามารถผลิต "Software Factory" ที่มีประสิทธิภาพ ยั่งยืน และขยายตัวได้จริงตามวิสัยทัศน์ของคุณ

---

## 1. Core Philosophy: "The Factory Model" (ปรัชญาโรงงาน)
**"Code คือสายพานการผลิต"** ไม่ใช่งานศิลปะที่จับต้องยาก ทุกอย่างต้องเป็นระบบ

### Key Principles
- **Modular & Replaceable (แยกส่วนและสับเปลี่ยนได้)**
  - มองโค้ดเป็น "ชิ้นส่วนอะไหล่" หรือ "พนักงาน" ในโรงงาน
  - *Scenario 1:* ฟีเจอร์นี้ไม่ใช้แล้ว -> ถอด Module นี้ออกได้ทันที โดยไม่กระทบส่วนอื่น (เหมือน Layoff พนักงาน 1 คน)
  - *Scenario 2:* ต้องการอัพเกรด -> ถอด Logic เก่าออก ใส่ Logic ใหม่เข้าไปแทนที่ได้ทันที (Replace Machine)
- **Pipeline Flow (งานไหลทางเดียว)**
  - Data ต้องไหลเป็น One-way flow เสมอ ไม่มีการย้อนศร หรือกระโดดข้ามขั้นตอนให้งง
- **Zero Redundancy (ห้ามทำซ้ำ)**
  - แก้ที่ "Blueprint" (Master Module) ที่เดียว ทุกส่วนที่เรียกใช้ต้องเปลี่ยนตามทันที

---

## 2. Backend Style: "Clean Service Layer"
**เป้าหมาย:** เขียนเพื่อให้ "ดูแลง่าย" (Maintainable) มากกว่าแค่ "ทำงานได้" (Functional)

### Rules
1.  **Controller = Receptionist (พนักงานต้อนรับ)**
    - **หน้าที่:** รับ Request, Validate Input เบื้องต้น, ส่งงานต่อให้ Service, ตอบ Response
    - **ข้อห้าม:** ห้ามมี Business Logic, ห้าม Query Database, ห้ามคำนวณซับซ้อน
2.  **Service = Specialist (ผู้เชี่ยวชาญ)**
    - **หน้าที่:** พระเอกของงาน Logic ทุกอย่างต้องกองรวมที่นี่ (Center of Truth)
    - **ข้อดี:** ถ้า Logic ผิด แก้ที่ Service ที่เดียวจบ
3.  **Code Characteristics**
    - **Low Line Count:** ฟังก์ชันต้องสั้น กระชับ (Short & Concise) อ่าน 3 วินาทีต้องเข้าใจ
    - **Explicit Files:** แยกไฟล์ชัดเจนตามหน้าที่ เช่น `user_service.py`, `vehicle_service.py`
    - **No God Objects:** ห้ามสร้างไฟล์เดียวที่ทำทุกอย่างในโลก

---

## 3. Frontend Style: "Smart Hooks, Dumb UI"
**เป้าหมาย:** แยกสมอง (Logic) ออกจากหน้าตา (UI) เพื่อให้ Designer หรือ Junior Dev ทำงานง่าย

### Rules
1.  **Components = The Face (หน้าตา)**
    - **ไฟล์ .tsx:** มีหน้าที่แค่ "แสดงผล" เท่านั้น (HTML/JSX + CSS Classes)
    - **Strict Rule:** ห้ามมี Logic หรือ State Management ซับซ้อนในไฟล์ Component
2.  **Custom Hooks = The Brain (สมอง)**
    - **ไฟล์ hooks/**: ดึง Logic, API Calls, State (`useState`, `useEffect`) ไปซ่อนไว้ใน Custom Hooks
    - *ตัวอย่าง:* แทนที่จะเขียน `fetch` ใน Component ให้สร้าง hook `useVehicleApproval()` แล้วเรียกใช้แทน
3.  **No Monolithic Pages**
    - ห้ามเขียน `page.tsx` ยาวเป็นกิโลเมตร
    - หน้า Page มีหน้าที่แค่เป็น Container จับ Component ย่อยมาวางเรียงกัน

---

## 4. Summary: The "Long-term Maintainer" Mindset
เราไม่ได้เขียนโค้ดเพื่อส่งงานครั้งเดียวแล้วทิ้ง แต่เรากำลังสร้างระบบที่ต้องอยู่ไปอีกยาวนาน

- **Onboarding:** เด็กใหม่มาอ่านปุ๊บ ต้องรู้ปั๊บว่าไฟล์ไหนทำอะไร
- **Debugging:** มีบั๊ก ต้องรู้ทันทีว่า "Station ไหนของโรงงาน" ที่พัง
- **Scaling:** อยากเพิ่มฟีเจอร์ต้องเหมือน "เพิ่มเครื่องจักรใหม่" เข้าไปในสายพาน ไม่ใช่รื้อโรงงานสร้างใหม่

> **Motto:** "สร้างระบบอัตโนมัติ ที่ดูแลตัวเองได้ และปรับเปลี่ยนได้ตลอดเวลาโดยไม่ต้องทุบทิ้ง"