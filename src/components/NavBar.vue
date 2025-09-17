<template>
<header class="nav">
<div class="brand" @click="$router.push('/rules')">학사 도우미</div>
<nav>
<RouterLink to="/rules" class="link" :class="{active: is('/rules')}">학사규정 확인</RouterLink>
<RouterLink to="/evidence" class="link" :class="{active: is('/evidence')}">증빙서류 가이드</RouterLink>
<!-- <RouterLink to="/ocr" class="link" :class="{active: is('/ocr')}">③ OCR 업로드 - 확인서 생성</RouterLink> -->
<RouterLink to="/developing" class="link" :class="{active: is('/developing')}">개발중</RouterLink>
</nav>
</header>
</template>


<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const is = (p)=> route.path.startsWith(p)
</script>


<style scoped>
.nav{ position:sticky; top:0; z-index:10; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 14px; border-bottom:1px solid var(--border); background:#fff }
.brand{ font-weight:800; cursor:pointer }
.link{ margin-left:10px; text-decoration:none; color:#374151; padding:8px 12px; border-radius:10px }
.link.active{ background:#111827; color:#fff }
</style>