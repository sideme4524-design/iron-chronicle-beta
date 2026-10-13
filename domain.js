import {beat, ending, worldStage} from './narrative.js';
export const VERSION=2;
export const clone=x=>structuredClone(x);
export const uid=()=>globalThis.crypto.randomUUID();
export const norm=s=>s.trim().toLocaleLowerCase().replace(/\s+/g,' ');
const assert=(ok,message)=>{if(!ok)throw Error(message);};
const num=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const integer=(v,min,max)=>Number.isInteger(v)&&num(v,min,max);
const text=(s,max=2000)=>typeof s==='string'&&s.length<=max;
const id=s=>text(s,160)&&s.length>0;
const date=n=>num(n,0,9e15);
const unique=a=>new Set(a).size===a.length;
export function exercise(name='Barbell Row',rest=60) {return {id:uid(),name,sets:3,reps:8,weight:0,rest,notes:''};}
export function routine(name='Pull A',rest=60) {return {id:uid(),name,description:'',archived:false,exercises:[exercise('Barbell Row',rest),exercise('Lat Pulldown',rest),exercise('Dumbbell Curl',rest)]};}
export function fresh(now=Date.now(),test=false) {const chapter={id:uid(),name:'첫 번째 훈련 시대',startedAt:now}; return {version:VERSION,meta:{revision:0,createdAt:now,updatedAt:now,test},settings:{onboarded:false,sfx:false,ambience:false,haptics:false,wake:false,rest:60,reduced:false},routines:[],chapters:[chapter],chapterId:chapter.id,selectedId:null,history:[],active:null,lastSeen:now};}
export function validRoutine(r) {return r&&id(r.id)&&text(r.name,80)&&r.name.trim().length>0&&text(r.description)&&typeof r.archived==='boolean'&&Array.isArray(r.exercises)&&r.exercises.length>0&&unique(r.exercises.map(e=>e.id))&&r.exercises.every(e=>id(e.id)&&text(e.name,100)&&e.name.trim().length>0&&integer(e.sets,1,100)&&integer(e.reps,1,200)&&num(e.weight,0,1000)&&integer(e.rest,5,1800)&&text(e.notes));}
export function nextSlot(a) {for(let i=0;i<a.routine.exercises.length;i++){const e=a.routine.exercises[i];for(let n=0;n<e.sets;n++)if(!a.logs.some(l=>l.exerciseId===e.id&&l.ordinal===n)&&!a.skips.some(l=>l.exerciseId===e.id&&l.ordinal===n))return {exercise:e,index:i,ordinal:n};}return null;}
export function world(s) {const sets=s.history.reduce((n,h)=>n+h.logs.length,0);return {sets,stage:worldStage(sets)};}
export function restState(a,now=Date.now()) {if(!a?.rest)return null;const elapsed=Math.max(0,(now-a.rest.startedAt)/1000),target=a.rest.target;const ratio=elapsed/target;return {elapsed,remaining:Math.max(0,Math.ceil(target-elapsed)),ready:elapsed>=target,stage:ratio<1/6?'impact':ratio<2/3?'motion':ratio<11/12?'buildup':ratio<1?'countdown':'hold'};}
export function lastRecord(s,name) {for(const h of [...s.history].reverse()){const e=h.routine.exercises.find(x=>norm(x.name)===norm(name));if(e){const logs=h.logs.filter(l=>l.exerciseId===e.id);if(logs.length)return logs.at(-1);}}return null;}
export function stats(h,history=[]) {const volume=h.logs.reduce((n,l)=>n+l.weight*l.reps,0),prev=[...history].reverse().find(x=>x.id!==h.id&&x.routine.id===h.routine.id);const prs=[];for(const e of h.routine.exercises){const old=history.filter(x=>x.id!==h.id&&x.endedAt<=h.startedAt).flatMap(x=>x.logs.map(l=>({...l,name:x.routine.exercises.find(y=>y.id===l.exerciseId)?.name}))).filter(l=>l.name&&norm(l.name)===norm(e.name));if(!old.length)continue;for(const l of h.logs.filter(l=>l.exerciseId===e.id)){const comparable=old.filter(p=>p.reps===l.reps);if(comparable.length&&l.weight>Math.max(...comparable.map(x=>x.weight))) {prs.push(`${e.name} · ${l.weight}kg × ${l.reps} (같은 횟수의 최고 중량)`);break;}}}return {sets:h.logs.length,exercises:new Set(h.logs.map(l=>l.exerciseId)).size,seconds:Math.max(0,Math.round(((h.endedAt??Date.now())-h.startedAt)/1000)),volume,comparison:prev?volume-prev.logs.reduce((n,l)=>n+l.weight*l.reps,0):null,prs};}
function validSession(a,finished,chapterIds) {
  if(!a||!id(a.id)||!validRoutine(a.routine)||!date(a.startedAt)||!chapterIds.includes(a.chapterId)||!id(a.expeditionId)||!integer(a.worldBefore,0,3)||!Array.isArray(a.logs)||!Array.isArray(a.skips))return false;
  const slot=l=>l&&a.routine.exercises.some(e=>e.id===l.exerciseId&&integer(l.ordinal,0,e.sets-1));
  if(!unique([...a.logs,...a.skips].map(l=>`${l.exerciseId}:${l.ordinal}`))||!unique(a.logs.map(l=>l.id))||!a.logs.every(l=>slot(l)&&id(l.id)&&date(l.at)&&l.at>=a.startedAt&&num(l.weight,0,1000)&&integer(l.reps,1,200)&&l.sessionId===a.id&&l.expeditionId===a.expeditionId&&l.beat&&id(l.beat.id)&&text(l.beat.impact)&&text(l.beat.motion)&&text(l.beat.buildup)&&integer(l.beat.phase,0,a.routine.exercises.length-1))||!a.skips.every(slot))return false;
  if(finished)return date(a.endedAt)&&a.endedAt>=a.startedAt&&a.logs.every(l=>l.at<=a.endedAt)&&['victory','withdrawal'].includes(a.outcome)&&id(a.chronicleId)&&text(a.narrative?.title)&&text(a.narrative?.body)&&integer(a.worldAfter,0,3)&&(a.outcome!=='victory'||!a.skips.length&&nextSlot(a)===null);
  return ['ready','lifting','logging','rest'].includes(a.mode)&&typeof a.paused==='boolean'&&(a.rest===null||a.rest&&date(a.rest.startedAt)&&a.logs.some(l=>l.id===a.rest.setId&&l.at===a.rest.startedAt)&&integer(a.rest.target,5,1800))&&(a.mode!=='rest'||a.rest!==null)&&nextSlot(a)!==null;
}
export function validate(s) {
  assert(s&&s.version===VERSION,'호환되지 않는 저장 버전입니다. 원본 파일을 보관하세요.');
  assert(s.meta&&integer(s.meta.revision,0,Number.MAX_SAFE_INTEGER)&&date(s.meta.createdAt)&&date(s.meta.updatedAt)&&typeof s.meta.test==='boolean','저장 메타데이터가 올바르지 않습니다.');
  assert(s.settings&&['onboarded','sfx','ambience','haptics','wake','reduced'].every(k=>typeof s.settings[k]==='boolean')&&integer(s.settings.rest,5,1800),'설정을 확인하세요.');
  assert(Array.isArray(s.routines)&&s.routines.every(validRoutine)&&unique(s.routines.map(r=>r.id)),'루틴 형식을 확인하세요.');
  assert(Array.isArray(s.chapters)&&s.chapters.length>0&&unique(s.chapters.map(c=>c.id))&&s.chapters.every(c=>id(c.id)&&text(c.name,80)&&c.name.trim().length&&date(c.startedAt))&&s.chapters.some(c=>c.id===s.chapterId),'훈련 챕터를 확인하세요.');
  assert(s.selectedId===null||s.routines.some(r=>r.id===s.selectedId),'선택한 루틴이 없습니다.');
  const chapters=s.chapters.map(c=>c.id);
  assert(Array.isArray(s.history)&&unique(s.history.map(h=>h.id))&&unique(s.history.map(h=>h.chronicleId))&&s.history.every(h=>validSession(h,true,chapters)),'운동 / 연대기 기록 형식을 확인하세요.');
  assert(s.active===null||validSession(s.active,false,chapters)&&!s.history.some(h=>h.id===s.active.id),'진행 중 원정 기록을 확인하세요.');
  assert(date(s.lastSeen),'복귀 시각을 확인하세요.');
  return s;
}
function finish(s,now,forceEarly=false) {const a=s.active;assert(a,'진행 중인 원정이 없습니다.');const outcome=!forceEarly&&!nextSlot(a)&&!a.skips.length?'victory':'withdrawal';const h={...a,endedAt:now,outcome,chronicleId:uid(),narrative:ending(outcome,a.logs.length)};delete h.mode;delete h.paused;delete h.rest;s.history.push(h);h.worldAfter=world(s).stage;s.active=null;return h;}
export function apply(input,command,now=Date.now()) {
  validate(input);const s=clone(input),a=s.active,c=command;
  switch(c.type) {
    case 'settings': {const allowed=['onboarded','sfx','ambience','haptics','wake','rest','reduced'];assert(Object.keys(c.patch).every(k=>allowed.includes(k)),'알 수 없는 설정입니다.');Object.assign(s.settings,c.patch);break;}
    case 'saveRoutine': {assert(validRoutine(c.routine),'루틴 입력을 확인하세요.');const r=clone(c.routine),i=s.routines.findIndex(x=>x.id===r.id);if(i<0)s.routines.push(r);else s.routines[i]=r;s.selectedId=r.id;break;}
    case 'archive': {const r=s.routines.find(r=>r.id===c.id);assert(r,'루틴을 찾을 수 없습니다.');r.archived=c.archived;break;}
    case 'duplicate': {const old=s.routines.find(r=>r.id===c.id);assert(old,'루틴을 찾을 수 없습니다.');const r={...clone(old),id:uid(),name:(old.name+' 복사').slice(0,80),archived:false};r.exercises.forEach(e=>e.id=uid());s.routines.push(r);s.selectedId=r.id;break;}
    case 'select': assert(s.routines.some(r=>r.id===c.id&&!r.archived),'선택 가능한 루틴이 없습니다.');s.selectedId=c.id;break;
    case 'chapter': {assert(text(c.name,80)&&c.name.trim(),'챕터 이름을 입력하세요.');const chapter={id:uid(),name:c.name.trim(),startedAt:now};s.chapters.push(chapter);s.chapterId=chapter.id;break;}
    case 'start': {assert(!a,'진행 중인 원정을 먼저 이어가거나 마쳐 주세요.');const r=s.routines.find(r=>r.id===(c.id??s.selectedId)&&!r.archived);assert(r,'사용할 루틴을 만들어 주세요.');s.active={id:uid(),expeditionId:uid(),chapterId:s.chapterId,routine:clone(r),startedAt:now,worldBefore:world(s).stage,logs:[],skips:[],rest:null,mode:'ready',paused:false};break;}
    case 'pause': assert(a,'진행 중 원정이 없습니다.');a.paused=true;break;
    case 'resume': assert(a,'진행 중 원정이 없습니다.');a.paused=false;break;
    case 'lift': assert(a&&!a.paused&&nextSlot(a),'진행 중 원정을 확인하세요.');a.mode='lifting';a.rest=null;break;
    case 'logging': assert(a&&a.mode==='lifting','세트 시작 상태를 확인하세요.');a.mode='logging';break;
    case 'log': {assert(a&&!a.paused&&a.mode==='logging','세트를 시작하고 마친 뒤 기록하세요.');assert(num(c.weight,0,1000)&&integer(c.reps,1,200),'중량 0~1000kg, 횟수 1~200을 입력하세요.');const slot=nextSlot(a);assert(slot,'이미 모든 세트를 기록했습니다.');const l={id:uid(),sessionId:a.id,expeditionId:a.expeditionId,exerciseId:slot.exercise.id,ordinal:slot.ordinal,weight:c.weight,reps:c.reps,at:now,beat:beat(a.expeditionId,slot.index,slot.ordinal,world(s).stage,s.history.length)};a.logs.push(l);a.rest={startedAt:now,target:s.meta.test?5:slot.exercise.rest,setId:l.id};a.mode='rest';if(!nextSlot(a))finish(s,now);break;}
    case 'undo': {let target=a;if(!target){const h=s.history.at(-1);assert(h?.logs.length,'취소할 기록이 없습니다.');s.history.pop();target=clone(h);for(const key of ['endedAt','outcome','chronicleId','narrative','worldAfter'])delete target[key];target.paused=false;s.active=target;}assert(target.logs.length,'취소할 기록이 없습니다.');target.logs.pop();target.rest=null;target.mode='ready';break;}
    case 'editLast': {const target=a??s.history.at(-1);assert(target?.logs.length,'수정할 기록이 없습니다.');assert(num(c.weight,0,1000)&&integer(c.reps,1,200),'중량과 횟수를 확인하세요.');Object.assign(target.logs.at(-1),{weight:c.weight,reps:c.reps});break;}
    case 'skip': {assert(a,'진행 중 원정이 없습니다.');const slot=nextSlot(a);assert(slot,'건너뛸 세트가 없습니다.');const e=slot.exercise;for(let n=slot.ordinal;n<e.sets;n++){if(!a.logs.some(l=>l.exerciseId===e.id&&l.ordinal===n)&&!a.skips.some(l=>l.exerciseId===e.id&&l.ordinal===n))a.skips.push({exerciseId:e.id,ordinal:n});if(!c.exercise)break;}a.mode='ready';a.rest=null;if(!nextSlot(a))finish(s,now,true);break;}
    case 'addSet': {assert(a,'진행 중 원정이 없습니다.');const e=nextSlot(a)?.exercise;assert(e&&e.sets<100,'세트 수를 확인하세요.');e.sets++;break;}
    case 'reorder': {assert(a,'진행 중 원정이 없습니다.');const from=a.routine.exercises.findIndex(e=>e.id===c.id),to=c.to;assert(from>=0&&integer(to,0,a.routine.exercises.length-1),'운동 순서를 확인하세요.');const touched=e=>a.logs.some(l=>l.exerciseId===e.id)||a.skips.some(l=>l.exerciseId===e.id);assert(!touched(a.routine.exercises[from])&&!touched(a.routine.exercises[to]),'아직 시작하지 않은 운동끼리 순서를 바꿔 주세요.');const [e]=a.routine.exercises.splice(from,1);a.routine.exercises.splice(to,0,e);break;}
    case 'finish': finish(s,now,c.early!==false);break;
    case 'seen':s.lastSeen=now;break;
    case 'testPhase':assert(s.meta.test&&a,'테스트 세계에서만 사용할 수 있습니다.');{const i=c.index;assert(integer(i,0,a.routine.exercises.length-1),'단계를 확인하세요.');a.logs=[];a.skips=a.routine.exercises.slice(0,i).flatMap(e=>Array.from({length:e.sets},(_,ordinal)=>({exerciseId:e.id,ordinal})));a.rest=null;a.mode='ready';}break;
    case 'testRest':assert(s.meta.test&&a?.rest,'테스트 휴식 중에만 사용할 수 있습니다.');{assert(num(c.elapsed,0,86400),'경과 시간을 확인하세요.');const t=Math.max(a.startedAt,now-c.elapsed*1000);a.rest.startedAt=t;a.logs.find(l=>l.id===a.rest.setId).at=t;}break;
    case 'testVictory': {assert(s.meta.test&&a,'테스트 세계에서만 사용할 수 있습니다.');a.skips=[];let slot;while((slot=nextSlot(a))){a.logs.push({id:uid(),sessionId:a.id,expeditionId:a.expeditionId,exerciseId:slot.exercise.id,ordinal:slot.ordinal,weight:slot.exercise.weight,reps:slot.exercise.reps,at:now,beat:beat(a.expeditionId,slot.index,slot.ordinal)});}finish(s,now);break;}
    case 'testClearHistory':assert(s.meta.test,'테스트 세계에서만 사용할 수 있습니다.');s.history=[];break;
    default:throw Error('알 수 없는 명령입니다.');
  }
  s.meta.updatedAt=now;return validate(s);
}
export function migrate(input,now=Date.now()) {
  if(input?.version===VERSION)return validate(clone(input));
  assert(input?.version===1&&Array.isArray(input.routines)&&Array.isArray(input.history)&&Array.isArray(input.archives),'호환되는 저장 파일이 아닙니다.');
  const s=fresh(now);s.settings.onboarded=true;s.settings.sfx=!!input.sound;
  const cv=r=>{assert(r&&id(r.id)&&Array.isArray(r.exercises),'기존 루틴이 손상되었습니다.');const x={id:r.id,name:r.name,description:r.day??'',archived:false,exercises:r.exercises.map(e=>({...e,rest:Math.max(5,r.rest??60),notes:''}))};assert(validRoutine(x),'기존 루틴 입력이 손상되었습니다.');return x;};
  s.routines=input.routines.map(cv);input.archives.forEach(x=>{const r=cv(x.routine);r.id=uid();r.archived=true;r.name=(r.name+' (이전)').slice(0,80);s.routines.push(r);});s.selectedId=input.routines[input.nextIndex??0]?.id??null;
  const cs=(old,finished)=>{const a={id:old.id,expeditionId:`legacy:${old.id}`,chapterId:s.chapterId,routine:cv(old.routine),startedAt:Date.parse(old.startedAt),worldBefore:world(s).stage,logs:[],skips:[],rest:null,mode:'ready',paused:!finished};assert(Array.isArray(old.logs),'기존 세트 기록이 손상되었습니다.');a.logs=old.logs.map(l=>({...l,id:uid(),ordinal:l.set,sessionId:a.id,expeditionId:a.expeditionId,at:finished?Date.parse(old.endedAt):a.startedAt,beat:beat(a.expeditionId,a.routine.exercises.findIndex(e=>e.id===l.exerciseId),l.set)}));if(finished){a.endedAt=Date.parse(old.endedAt);a.outcome=!nextSlot(a)?'victory':'withdrawal';a.chronicleId=uid();a.narrative=ending(a.outcome,a.logs.length);a.worldAfter=worldStage(world(s).sets+a.logs.length);delete a.rest;delete a.mode;delete a.paused;}else if(old.restUntil>now&&a.logs.length){const l=a.logs.at(-1);const target=Math.max(5,old.routine.rest??60);l.at=Math.max(a.startedAt,old.restUntil-target*1000);a.rest={startedAt:l.at,target,setId:l.id};a.mode='rest';}return a;};
  for(const h of input.history)s.history.push(cs(h,true));
  if(input.active){s.active=cs(input.active,false);if(!nextSlot(s.active))finish(s,now);}
  return validate(s);
}
