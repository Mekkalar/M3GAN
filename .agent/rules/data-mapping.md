---
trigger: manual
---

# Data Mapping & Transformation Standard

> **Protocol:** "Map Once, Map Specific."
> มาตรฐานการจัดการความสัมพันธ์ของข้อมูล (Join/Intersect), การแปลงร่างข้อมูล (Transformation), และการทำ DTO เพื่อป้องกัน Spaghetti Code

---

## 1. Where to Join? (Query Strategy)
การดึงข้อมูลที่มีความสัมพันธ์กัน (Relation) ให้ยึดหลักการนี้

### 1.1 Database Level Join (SQL/ORM)
*ใช้เมื่อ:* ต้องการ Filter/Sort จากตารางลูก หรือต้องการ Performance สูงสุด
*ข้อดี:* เร็ว จบใน Query เดียว
*ข้อควรระวัง:* อย่า Join เกิน 3-4 Table ใน Query เดียว จะดูแลยากและช้า

```typescript
// ✅ Good: Join เฉพาะที่ใช้
const users = await queryBuilder
  .leftJoinAndSelect("user.roles", "role")
  .where("role.name = :name", { name: "admin" })
  .getMany();
```

### 1.2 Application Level Join (Mapping in Code)
*ใช้เมื่อ:* ข้อมูลอยู่คนละ Microservice, หรือต้องการ Logic ซับซ้อนในการจับคู่
*วิธีทำ:* ดึงข้อมูลแยก (Fetch A, Fetch B) แล้วมา map กันใน Memory (ใช้ Map/Dictionary เพื่อ O(1))

```typescript
// ✅ Good: ดึงแยกแล้ว Map ใน App (ดีกว่า N+1 Query)
const orders = await orderRepo.find();
const userIds = orders.map(o => o.userId);
const users = await userRepo.findByIds(userIds); // Batch Fetch

const userMap = new Map(users.map(u => [u.id, u])); // สร้าง Lookup Table

orders.forEach(order => {
  order.user = userMap.get(order.userId); // Map เร็วๆ ไม่ต้อง loop ซ้อน
});
```

---

## 2. DTO & Transformation Model
ห้ามส่ง Entity ของ Database ออกไปหน้าบ้านตรงๆ (Security Risk & Coupling)

### 2.1 Entity vs Response DTO
*   **Entity:** หน้าตาตาม Table ใน DB (มี password, internal flags) -> *ห้ามส่งออกนอก*
*   **DTO (Data Transfer Object):** หน้าตาตามที่ Frontend อยากได้ (ตัด password ออก, เปลี่ยน format วันที่)

### 2.2 Mapper Pattern
ต้องมี Function หรือ Class ไว้สำหรับแปลงร่างโดยเฉพาะ แยกออกจาก BL
```typescript
// ❌ Bad: แปลงใน Controller รกๆ
// ✅ Good: ใช้ Mapper Class
class UserMapper {
  static toResponse(user: UserEntity): UserDto {
    return {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`, // รวม field
      role: user.roles[0]?.name || 'guest', // Flatted structure
      lastActive: formatDate(user.lastLogin) // Format date
    };
  }
}
```

---

## 3. Set Operations (Intersect / Union / Diff)
การจัดการ Array ของข้อมูล ใช้ Lodash หรือ Set เพื่อความสะอาด

*   **Intersection (เอาตัวที่ซ้ำ):** หาของที่มีในทั้ง 2 List
    ```typescript
    const commonIds = lodash.intersection([1, 2], [2, 3]); // => [2]
    ```
*   **Difference (หาตัวที่หายไป):** หาของที่มีใน A แต่ไม่มีใน B (เช่น หา user ที่ยังไม่ได้จ่ายเงิน)
    ```typescript
    const unPaidUsers = lodash.difference(allUserIds, paidUserIds);
    ```
*   **Union (รวมกันไม่ซ้ำ):**
    ```typescript
    const allUniqueTags = lodash.union(tagsA, tagsB);
    ```

---

## 4. Definition of Done
- [ ] **No Leak:** ห้ามส่ง Database Entity ออกไปที่ API Response ตรงๆ
- [ ] **No N+1:** เช็คว่าไม่มี Query งอกใน Loop (ให้ใช้ `.include()` หรือ Batch Fetch)
- [ ] **Explicit Mapping:** มี Mapper/DTO ชัดเจน ไม่ใช่ `Object.assign` มั่วๆ