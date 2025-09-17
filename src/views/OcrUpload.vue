<template>
    <main class="wrap">
        <h1>③ OCR 업로드 — 확인서 자동 생성</h1>
        <div class="panel">
            <p>이미지/PDF를 업로드하면 백엔드에서 학사 양식에 맞춘 텍스트/DOCX/PDF를 만들어줍니다.</p>
            <FileUploader @done="onDone" />


            <section v-if="resultTxt" class="panel" style="margin-top:18px">
                <h2>TXT 결과</h2>
                <textarea readonly :value="resultTxt"></textarea>
                <button @click="downloadTxt" style="margin-top:8px">TXT 다운로드</button>
            </section>


            <section v-if="fileUrl" class="panel" style="margin-top:18px">
                <h2>파일 다운로드</h2>
                <a :href="fileUrl" :download="fileName">{{ fileName }}</a>
            </section>


            <section v-if="fields" class="panel" style="margin-top:18px">
                <h2>추출된 필드</h2>
                <ul>
                    <li>사유: {{ fields.사유 || '-' }}</li>
                    <li>날짜: {{ fields.날짜 || '추출 실패' }}</li>
                    <li>상세: {{ fields.병원명 ? fields.병원명 + ' 방문' : '-' }}</li>
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


function onDone({ out, payload }){
    resultTxt.value=''; fields.value=null; revoke(); fileName.value=''
    if(payload.type === 'json'){
        resultTxt.value = payload.data?.result || ''
        fields.value = payload.data?.fields || null
    }else{
        fileName.value = payload.filename
        fileUrl.value = URL.createObjectURL(payload.blob)
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