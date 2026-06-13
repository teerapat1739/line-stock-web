<script setup lang="ts">
import ComingSoonPage from './ComingSoonPage.vue'
</script>

<template>
  <ComingSoonPage
    title="ตั้งค่าระบบ"
    subtitle="จัดการผู้ใช้งาน · เปลี่ยนรหัสผ่านแอดมิน · เปิด/ปิด LLM"
    :bullets="[
      'แต่งตั้ง staff เป็น admin (และถอด)',
      'เปลี่ยนรหัสผ่านแอดมิน (ไม่ต้องเขียน SQL)',
      'เปิด/ปิด LLM tier (ENABLE_LLM)',
      'ตั้งเกณฑ์ของใกล้หมดเริ่มต้น',
      'อนุญาตเฉพาะกลุ่ม LINE ที่กำหนด',
      'ดู log ของ LINE webhook ล่าสุด'
    ]"
  />
</template>
