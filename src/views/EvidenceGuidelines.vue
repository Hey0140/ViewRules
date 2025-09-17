<template>
    <main class="wrap">
        <h1>② 증빙서류 가이드 — 무엇을 준비해야 하나요?</h1>
        <div class="panel">
            <p>내 상황(유형)에 따라 제출할 자료 체크리스트를 보여줍니다.</p>


            <div class="row">
                <div>
                    <div class="card">
                        <label>유형</label>
                        <select v-model="form.type">
                            <option value="사유">사유</option>
                            <option value="공가">공가</option>
                        </select>


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
                        
                        <template v-else-if="form.type === '공가'">
                            <label style="margin-top:8px">공가</label>
                            <div class="select">
                                <select v-model="form.reason">
                                <option value="면접">면접</option>
                                <option value="코딩테스트">코딩테스트</option>
                                <option value="채용검진">채용검진</option>
                                <option value="졸업식">졸업식</option>
                                <option value="국가 관련 소집">국가 관련 소집</option>
                                <option value="경조사">경조사</option>
                                <option value="천재지변">천재지변</option>
                                <option value="기타">기타</option>
                                </select>
                            </div>
                        </template>
                        

                        <button class="primary" style="margin-top:10px" @click="build">체크리스트 생성</button>
                    </div>
                </div>
                <div>
                    <div class="card">
                        <h3>제출 체크리스트</h3>
                        <ul v-if="items.length">
                            <li v-for="(it, i) in items" :key="i">{{ it }}</li>
                            <P  v-if="noneitems.length"><B>제출 불가능 한 것</B></P>
                            <li v-for="(it, i) in noneitems" :key="i">{{ it }}</li>
                        </ul>
                        <p v-else class="muted">왼쪽에서 정보를 입력하고 생성하세요.</p>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>


<script setup>
import { ref } from 'vue'

const form = ref({ type:'공가', reason:'면접' })
const items = ref([])
const noneitems = ref([])  // ✨ 추가: 제출 불가/불인정 항목 리스트

function build(){
  const out = []
  const notOk = []

  // 공통
//   out.push('사유서(간단 양식): 날짜/시간/사유 기재')
//   out.push('결석/외출 일자 및 시간 명시')

  if(form.value.type === '사유'){
    switch(form.value.reason){

      case '지하철연착':
        out.push('지연증명서 (지연 10분 이상부터 인정)')
        out.push('교통카드 사용내역 (일자·시간·역명 기재 必)')
        break

      case '병원진료':
        out.push('진료확인서 (의사 소견·일자·본인 이름·병원명·병원 직인 포함)')
        notOk.push('영수증', '처방전')  // 소명 불가
        break

      case '독감':
        out.push('의사 소견서 (격리 필요 명시)')
        out.push('최대 5일 범위 내 인정')
        break

      case '공식행사참가':
        out.push('참가 확인서 또는 인증 사진(본인이 나오도록)')
        out.push('행사명/일자 표기')
        // 주의: 대부분 사유 처리, 공가 아님
        break

      case '자격증 시험':
        out.push('응시 확인서')
        out.push('국가 자격증 또는 취업 관련 자격증 여부 확인')
        break

      case '취업 관련 외출':
        out.push('초청장/안내 메일/출입증 등 참석 증빙')
        break

      default:
        out.push('관련 사실을 확인할 수 있는 참고 자료(이메일/문자/사진 등)')
    }

  } else if(form.value.type === '공가') {
    switch(form.value.reason){

      case '면접':
        out.push('면접확인서')
        out.push('확인서 미발급 시: 면접 안내 메일 캡처(본인 이름·날짜 必)')
        break

      case '코딩테스트':
        out.push('참가확인서')
        out.push('확인서 미발급 대비: 입장 전/후 화면 캡처 필수')
        // (참고) 주말 응시의 경우 운영정책에 따라 사유 처리로 보는 곳도 있음
        break

      case '채용검진':
        out.push('검진확인서 (취업 관련 검진임을 명시)')
        notOk.push('일반 건강 검진 확인서')  // 불가
        break

      case '졸업식':
        out.push('학교 공식 안내/초청장 또는 참석 확인 자료')
        break

      case '국가 관련 소집':
        out.push('소집 통지서/훈련 명령서')
        break

      case '경조사':
        out.push('가족관계 증빙(가족관계증명서 등)')
        out.push('청첩장/부고/장례식장 확인 자료 중 택1')
        break

      case '천재지변':
        out.push('재난 문자/관공서 통보/언론 보도/교통 통제 공지 등 상황 증빙')
        break

      default:
        out.push('관련 공식 문서 또는 주최 측 확인서')
    }
  }

  items.value = out
  noneitems.value = notOk
}
</script>


<style scoped>
.muted{ color:#6b7280 }
</style>