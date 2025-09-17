import { createRouter, createWebHistory } from 'vue-router'
import RulesCheck from '../views/RulesCheck.vue'
import EvidenceGuidelines from '../views/EvidenceGuidelines.vue'
import OcrUpload from '../views/OcrUpload.vue'
import Developing from '../components/Developing.vue'


const routes = [
    { path: '/', redirect: '/rules' },
    { path: '/rules', name: 'RulesCheck', component: RulesCheck },
    { path: '/evidence', name: 'EvidenceGuidelines', component: EvidenceGuidelines },
    { path: '/ocr', name: 'OcrUpload', component: OcrUpload },
    { path: '/developing', name: 'Develop', component: Developing },
]


const router = createRouter({
history: createWebHistory(),
routes,
scrollBehavior(){ return { top: 0 } }
})


export default router