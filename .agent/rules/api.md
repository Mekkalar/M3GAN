---
trigger: manual
---

# API Response & Error Handling Standard

> **Protocol:** "Consistent Communication."
> ข้อตกลงมาตรฐานในการส่งข้อมูลระหว่าง Frontend และ Backend เพื่อลดปัญหาการ Parse ข้อมูลผิดพลาด

---

## 1. JSON Response Structure (Format กลาง)
ทุก API ต้องคืนค่าในรูปแบบนี้เสมอ ไม่ว่าจะสำเร็จหรือล้มเหลว ห้าม return List หรือ String โดดๆ

### 1.1 Success Response (HTTP 200/201)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "role": "admin"
  },
  "meta": {
    "timestamp": "2024-02-06T10:00:00Z",
    "version": "1.0"
  }
}
```

### 1.2 Pagination Response (List)
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Item A" },
    { "id": 2, "name": "Item B" }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total_items": 50,
    "total_pages": 5
  }
}
```

### 1.3 Error Response (HTTP 4xx/5xx)
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID 1 does not exist.",
    "details": "Database query returned null." // (Opional: Show only in DEV)
  },
  "meta": {
    "request_id": "req-1234-5678" // Correlation ID for tracing
  }
}
```

---

## 2. HTTP Status Codes
ห้ามใช้ 200 OK กับ Error! ให้ใช้ Status Code ตามมาตรฐานจริง:

- **200 OK:** สำเร็จ / คืนค่าข้อมูล
- **201 Created:** สร้างข้อมูลใหม่สำเร็จ (POST)
- **204 No Content:** ทำงานสำเร็จแต่ไม่มี data คืนกลับ (เช่น DELETE)
- **400 Bad Request:** ส่ง Input มาผิด Format (Validation Error)
- **401 Unauthorized:** ไม่ได้แนบ Token หรือ Token หมดอายุ
- **403 Forbidden:** มี Token แต่ไม่มีสิทธิ์เข้าถึง (Permission Denied)
- **404 Not Found:** หา Resource ไม่เจอ
- **422 Unprocessable Entity:** Input ถูกต้องตาม Format แต่ผิด Logic (เช่น อีเมลซ้ำ)
- **500 Internal Server Error:** Server บึ้ม (Database พัง, Code Bug)

---

## 3. Error Code Catalog (ตัวอย่าง)
กำหนด Error Code ให้เป็น Readable String เพื่อให้ Frontend เอาไป map กับข้อความภาษาต่างๆ ได้ง่าย

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `AUTH_INVALID_TOKEN` | 401 | Token ผิดหรือหมดอายุ |
| `PERM_DENIED` | 403 | user ไม่มีสิทธิ์ทำรายการนี้ |
| `RES_NOT_FOUND` | 404 | หาข้อมูลไม่เจอ |
| `VAL_INVALID_EMAIL` | 400 | รูปแบบอีเมลไม่ถูกต้อง |
| `SYS_DB_ERROR` | 500 | Database connection failed |

---

## 4. Implementation Guidelines
- Backend ต้องทำ **Global Exception Filter** เพื่อดัก Error ทุกตัวแล้วแปลงเป็น Format ข้างบนนี้ก่อนส่งออกไป
- Frontend สร้าง **Axios Interceptor** เพื่อดัก Response แบบ Global (เช่น ถ้าเจอ 401 ให้ดีดไปหน้า Login ทันที)