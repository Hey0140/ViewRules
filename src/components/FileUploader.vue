
<template>
  <div class="card">
    <div class="row">
      <label>
        파일 업로드 (이미지/PDF)
        <input type="file" @change="onFile" accept="image/*,.pdf" />
      </label>

      <div>
        <span class="label">출력 형식</span>
        <div class="chips">
          <button :class="btn('txt')"  @click="out='txt'">TXT</button>
          <button :class="btn('docx')" @click="out='docx'">DOCX</button>
          <button :class="btn('pdf')"  @click="out='pdf'">PDF</button>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="primary" :disabled="!file || loading" @click="submit">
        {{ loading ? '처리 중...' : '문서 생성하기' }}
      </button>
      <button :disabled="!file || loading" @click="submitExtract">양식 JSON 추출</button>
      <button :disabled="loading" @click="reset">초기화</button>
    </div>

    <p v-if="error" class="error">⚠️ {{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { generateDoc, extractByImageFile } from '../services/api.js'

const emit = defineEmits(['done'])
const file = ref(null)
const out = ref('txt')
const loading = ref(false)
const error = ref('')

function onFile(e){ file.value = e.target.files?.[0] || null }
function reset(){ file.value = null; error.value = '' }
function btn(kind){ return { chip:true, active: out.value === kind } }

async function submit(){
  error.value=''
  if(!file.value){ error.value='파일을 선택하세요.'; return }
  loading.value=true
  try{
    const res = await generateDoc(file.value, out.value)
    emit('done', { out: out.value, payload: res })
  }catch(e){ error.value = e?.message || '처리 실패' }
  finally{ loading.value=false }
}

// ✨ OpenAI 백엔드로 양식(JSON) 추출
async function submitExtract(){
  error.value=''
  if(!file.value){ error.value='파일을 선택하세요.'; return }
  loading.value=true
  try{
    const data = await extractByImageFile(file.value) // { type, reason, date, details, ... } 예상
    emit('done', { out: 'json', payload: { type:'json', data } })
  }catch(e){ error.value = e?.message || '추출 실패' }
  finally{ loading.value=false }
}
</script>

<style scoped>
.card{ border:1px solid #e5e7eb; border-radius:12px; padding:16px }
.row{ display:grid; grid-template-columns:1fr 1fr; gap:16px }
.label{ display:block; margin-bottom:6px; font-weight:600 }
input[type="file"]{ width:100% }
.actions{ display:flex; gap:8px; margin-top:12px }
button{ padding:8px 12px; border-radius:10px; border:1px solid #d1d5db; background:#fff; cursor:pointer }
button.primary{ background:#16a34a; color:#fff; border-color:#16a34a }
button:disabled{ opacity:.6; cursor:not-allowed }
.chips{ display:flex; gap:8px }
.chip{ padding:8px 12px; border:1px solid #d1d5db; border-radius:999px; background:#fff; cursor:pointer }
.active{ background:#111827; color:#fff; border-color:#111827 }
.error{ color:#dc2626; margin-top:8px }
</style>


<!-- ========================= OcrPage.vue (patched) ========================= -->
