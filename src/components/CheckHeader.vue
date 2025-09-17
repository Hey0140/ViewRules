<template>
  <div class="card">
  <div class="row">
  <label>
    파일 업로드 (이미지/PDF)
    <input type="file" @change="onFile" accept="image/*,.pdf" />
  </label>


  <div>
    <div style="margin-bottom:6px; font-weight:600">출력 형식</div>
      <div class="chips">
        <button :class="btn('txt')" @click="out='txt'">TXT</button>
        <button :class="btn('docx')" @click="out='docx'">DOCX</button>
        <button :class="btn('pdf')" @click="out='pdf'">PDF</button>
      </div>
    </div>
  </div>


  <div style="display:flex; gap:8px; margin-top:12px">
    <button class="primary" :disabled="!file || loading" @click="submit">
      {{ loading ? '처리 중...' : '생성하기' }}
    </button>
    <button :disabled="loading" @click="reset">초기화</button>
  </div>


  <p v-if="error" class="error">⚠️ {{ error }}</p>
  </div>
</template>