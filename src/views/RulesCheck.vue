<template>
  <main class="wrap">
    <h1>① 학사규정 확인 — 사유·공가 가능 여부</h1>
    <div class="panel">
      <p>
        우리 반/학과 기준 <b>학사 규정(Markdown)</b>을 자동으로 불러와 보여줍니다.
        아래 규정을 기준으로 내 상황이 <b>사유</b> 또는 <b>공가</b>에 해당하는지 확인합니다.
      </p>

      <h3>규정 보기 (Markdown)</h3>
      <div class="card">
        <pre v-if="!html" class="md-raw" v-text="rules"></pre>
        <div v-else v-html="html"></div>
      </div>

      <div class="row" style="margin-top:12px">
        <div>
          <h3>내 상황</h3>
          <div class="card">
            <label>유형</label>
            <div class="select">
              <select v-model="form.type">
                <option value="사유">사유</option>
                <option value="공가">공가</option>
                <option value="검색">검색</option>
              </select>
            </div>

            <!-- 사유 모드: 사유 셀렉트만 표시 -->
            <template v-if="form.type === '사유'">
              <label style="margin-top:8px">사유</label>
              <div class="select">
                <select v-model="form.reason">
                  <option value="병원진료">병원진료</option>
                  <option value="공식행사참가">공식행사참가(취업박람회, 해커톤)</option>
                  <option value="독감">독감</option>
                  <option value="지하철연착">지하철연착</option>
                  <option value="자격증 시험">자격증 시험</option>
                  <option value="취업 관련 외출">취업 관련 외출</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </template>

            <!-- 공가 모드: 공가 셀렉트만 표시 -->
            <template v-else-if="form.type === '공가'">
              <label style="margin-top:8px">공가</label>
              <div class="select">
                <select v-model="form.reason">
                  <option value="면접">면접</option>
                  <option value="코딩테스트">코딩테스트</option>
                  <option value="졸업식">졸업식</option>
                  <option value="국가 관련 소집">국가 관련 소집</option>
                  <option value="경조사">경조사</option>
                  <option value="천재지변">천재지변</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </template>

            <!-- 검색 모드: 입력창만 표시 (입력값을 form.reason에 주입) -->
            <template v-else>
              <label style="margin-top:8px">사유 검색</label>
              <div style="display:flex; gap:8px; align-items:center">
                <input type="text" v-model="search" class="input" placeholder="예: 버스 연착 등" />
                <!-- <button class="ghost" @click="applySearch">검색</button> -->
              </div>
            </template>

            <button class="primary" style="margin-top:10px" @click="check">가능 여부 확인</button>
          </div>
        </div>

        <div>
          <h3>결과</h3>
          <div class="card">
            <p v-if="result === null" class="muted">왼쪽에서 정보를 선택/입력하고 확인을 누르세요.</p>
            <template v-else>
              <p><b>판정:</b> {{ result.allowed }}</p>
              <p><b>근거:</b> {{ result.reasoning }}</p>
              <p v-if="result.notes" class="muted">참고: {{ result.notes }}</p>
            </template>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const rules = ref('')
const html = ref('')
const search = ref('')
const form = ref({ type:'공가', reason:'면접' })
const result = ref(null)

function applySearch(){
  const v = (search.value || '').trim()
  if(!v) return
  form.value.reason = v
}

onMounted(async () => {
  try {
    const resp = await fetch('/rules-default.md', { cache: 'no-cache' })
    rules.value = resp.ok ? await resp.text() : '공가/사유 규정을 준비해 주세요.'
  } catch {
    rules.value = '공가/사유 규정을 준비해 주세요.'
  }

  try {
    const { default: MarkdownIt } = await import('markdown-it')
    const { default: DOMPurify } = await import('dompurify')
    const md = new MarkdownIt({ breaks: true })
    html.value = DOMPurify.sanitize(md.render(rules.value))
  } catch { /* 패키지 없으면 raw로 표시 */ }
})

function classifyReason(query){
  const q = (query || '').toLowerCase().replace(/\s+/g, '')


  /** [정규식, 정규화 라벨] 쌍 배열 */
  const GONGGA = [
    [/면접|인터뷰|채용면접|채용.?면점/, '면접'],
    [/코딩테스트|코테|온라인테스트|온라인코테/, '코딩테스트'],
    [/졸업식/, '졸업식'],
    [/예비군|민방위|국가.*소집|동원훈련/, '예비군/국가 소집'],
    [/경조사|결혼|사망|장례|부고/, '경조사(결혼/사망)'],
    [/천재지변|지진|홍수|태풍|폭설|폭우/, '천재지변'],
    [/채용검진|채용.?검진/, '채용검진']
    ]
  const SAYU = [
    [/병원|병원.?진료|병원.?방문|진료.?확인서|통원|외래/, '병원진료'],
    [/독감|인플루엔자|플루/, '독감'],
    [/코로나|covid|확진/, '코로나'],
    [/지하철.?연착|대중교통.?지연|지하철.?지연/, '지하철연착'],
    [/자격증.?시험|국가.?자격|토익|토플|한국사.?시험/, '자격증 시험'],
    [/공식.?행사.?참가|대회.?참가|해커톤|취업.?박람회/, '공식행사참가'],
    [/취업.?관련.?외출|기업.?설명회|채용.?설명회/, '취업 관련 외출']
    ]
  const INVALID = [
    [/버스.?연착|버스.?지연/, '버스 연착'],
    [/은행.?방문|은행업무/, '은행 방문'],
    [/행정복지센터.?방문|주민센터.?방문|동사무소.?방문/, '행정복지센터 방문'],
    [/이사|이삿날|이주/, '이사'],
    [/학교.?행사(?!.*졸업식)/, '학교 행사(졸업식 제외)'],
    [/검진/, '건강 검진(채용 검진X)']
  ]


  const tryMatch = (pairs) => {
    for(const [re, label] of pairs){ if(re.test(q)) return { label } }
    return null
  }


  const g = tryMatch(GONGGA); if(g) return { category:'공가', label:g.label }
  const s = tryMatch(SAYU); if(s) return { category:'사유', label:s.label }
  const i = tryMatch(INVALID);if(i) return { category:'불가', label:i.label }
  return { category:'미분류', label:null }
}


function check(){
  const text = rules.value.replace(/\s+/g,' ')
  let allowed = false
  let reasoning = ''
  let notes = ''

  if(form.value.type === '검색'){
    const v = (search.value || '').trim()
    if(!v) return
    form.value.reason = v
    const c = classifyReason(v)

    if(c.category === '사유' || c.category === '공가'){
      allowed = c.category
    }
    if(c.category === '불가'){
      allowed = c.category
      result.value = {  allowed, reasoning:`'${v}'은(는) 사유/공가 불가 항목입니다. `, notes:'위 내용은 키워드 기반으로 답변합니다. 부정확할 수 있으니 프로님께 직접 확인하시길 바랍니다.' }
    } else if(c.category === '미분류'){
      allowed = c.category
      result.value = {  allowed, reasoning:`'${v}'은(는) 확인이 불가능합니다. 프로님께 문의해주세요. `, notes:'위 내용은 키워드 기반으로 답변합니다. 부정확할 수 있으니 프로님께 직접 확인하시길 바랍니다.' }
    }  else{
      reasoning = '사유/공가 가능할 항목일 수 있습니다'
      result.value = { allowed, reasoning, notes }
    }

    
    return
  }

  if(form.value.type === '사유'){
    if(/사유조퇴.*사전 승인.*병원\s*방문.*(확인서|증명)/.test(text) && /병원진료|독감|지하철연착|자격증 시험|공식행사참가|취업 관련 외출|기타/.test(form.value.reason)){
      allowed = '가능'
      reasoning = '관련된 증빙 자료를 준비해주세요'
      notes = '사유 결석은 20일까지 가능합니다'
    }
  }

  if(form.value.type === '공가'){
    if(/공가.*(병원|면접|코딩테스트|졸업식|국가|경조사|천재지변).*(인정|허용)/.test(text)){
      allowed = true
      reasoning = '규정상 해당 사유에 대해 공가 인정'
      reasoning = '취업 관련 결석은 월 3회까지만 가능합니다'
    }
  }

  if(!reasoning){
    reasoning = '규정 텍스트에 해당 조건이 명시되어 있지 않거나, 키워드 매칭에 실패했을 수 있음'
    notes = 'OCR 결과를 더 정제하거나, 규칙 사전을 보강해 주세요.'
  }

  result.value = { allowed, reasoning, notes }
}
</script>

<style scoped>
.md-raw{ white-space:pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.muted{ color:#6b7280 }
</style>
