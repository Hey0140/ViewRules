<template>
  <main class="wrap">
    <h1>③ OCR 업로드 — 확인서 자동 생성</h1>
    <div class="panel">
      <p>이미지/PDF를 업로드하면 백엔드에서 학사 양식에 맞춘 텍스트/DOCX/PDF 또는 <b>양식 JSON</b>을 만들어줍니다.</p>

      <FileUploader @done="onDone" />

      <section v-if="resultTxt" class="panel" style="margin-top:18px">
        <h2>결과 (JSON/TXT 미리보기)</h2>
        <textarea readonly :value="resultTxt" style="min-height:180px"></textarea>
        <button v-if="!fileUrl" @click="downloadTxt" style="margin-top:8px">텍스트로 저장</button>
      </section>

      <section v-if="fileUrl" class="panel" style="margin-top:18px">
        <h2>파일 다운로드</h2>
        <a :href="fileUrl" :download="fileName">{{ fileName }}</a>
      </section>

      <section v-if="fields" class="panel" style="margin-top:18px">
        <h2>추출된 필드</h2>
        <ul>
          <li v-for="(v,k) in fields" :key="k"><b>{{ k }}:</b> {{ v ?? '-' }}</li>
        </ul>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import FileUploader from '../components/FileUploader.vue'

const resultTxt = ref('')
const fields = ref(null)
const fileUrl = ref('')
const fileName = ref('')

function revoke(){ if(fileUrl.value){ URL.revokeObjectURL(fileUrl.value); fileUrl.value='' } }

// payload: { type:'json', data } | { type:'blob', blob, filename }
function onDone({ out, payload }){
  resultTxt.value=''; fields.value=null; revoke(); fileName.value=''

  if(payload.type === 'json'){
    const data = payload.data || {}
    // 1) 서버가 data.fields 형태로 줄 수도 있고,
    // 2) OpenAI 구조화 결과({ type, reason, date, details })로 올 수도 있음 → 통합 노멀라이즈
    if(data.fields){
      resultTxt.value = data.result ? String(data.result) : JSON.stringify(data.fields, null, 2)
      fields.value = data.fields
    }else{
      // 구조화 결과를 한글 키로 매핑해서 보여줌
      const norm = {
        유형:   data.type    ?? data.유형,
        사유:   data.reason  ?? data.사유,
        날짜:   data.date    ?? data.날짜,
        상세:   data.details ?? data.상세 ?? (data.병원명 ? `${data.병원명} 방문` : undefined)
      }
      // 미리보기 텍스트는 JSON 전체를 보여주기
      resultTxt.value = JSON.stringify(data, null, 2)
      // undefined 값은 걸러서 표시 깔끔하게
      fields.value = Object.fromEntries(Object.entries(norm).filter(([,v]) => v !== undefined))
    }
  } else {
    fileName.value = payload.filename
    fileUrl.value = URL.createObjectURL(payload.blob)
    resultTxt.value = ''
  }
}

function downloadTxt(){
  const blob = new Blob([resultTxt.value || ''], { type:'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'output.txt'
  document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(url)
}

onBeforeUnmount(revoke)
</script>

<style scoped>
</style>
