<script setup lang="ts">
import ComingSoonPage from './ComingSoonPage.vue'
</script>

<template>
  <ComingSoonPage
    title="จัดการรายการของ"
    subtitle="หน้าสำหรับเพิ่ม/แก้ของในคลัง · ตั้งเกณฑ์ของใกล้หมด · กำหนดสัดส่วน pack"
    :bullets="[
      'เพิ่มของใหม่ + กำหนดหน่วยหลัก',
      'แก้ชื่อ / หน่วย / pack ratio (1 pack = ? ขวด)',
      'ตั้งค่า low_threshold ให้บอทแจ้งเตือนใน LINE',
      'ดูประวัติเต็มของแต่ละรายการ',
      'นำเข้า/ส่งออกข้อมูล (CSV)'
    ]"
  />
</template>
