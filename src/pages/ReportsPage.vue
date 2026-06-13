<script setup lang="ts">
import ComingSoonPage from './ComingSoonPage.vue'
</script>

<template>
  <ComingSoonPage
    title="รายงาน + ส่งออก"
    subtitle="สรุปรายวัน / รายเดือน · ค่าใช้จ่ายตามหมวด · ส่งออกเป็น CSV หรือ PDF"
    :bullets="[
      'สรุปรายวัน: เติม / เบิก / มูลค่ารวม',
      'สรุปรายเดือนแบบเปรียบเทียบเดือนต่อเดือน',
      'แยกตามหมวดของ (เนื้อ / ผัก / เครื่องปรุง / ฯลฯ)',
      'Top movers — ของที่ใช้มากที่สุด',
      'ส่งออก CSV สำหรับนำเข้าระบบบัญชี',
      'พิมพ์ PDF สำหรับเอกสาร'
    ]"
  />
</template>
