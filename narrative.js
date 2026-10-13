export const CAMPAIGN = 'CHAPTER 01 · THE EMBERLANDS';
export const EXPEDITION = '북부 성벽 탈환';
export const STAGES = ['잿불 야영지', '보강된 야영지', '북부 전초기지', '요새 마을'];
export const worldStage = sets => sets >= 45 ? 3 : sets >= 18 ? 2 : sets > 0 ? 1 : 0;
export function hash(s) { let h=2166136261; for(const c of s) h=Math.imul(h^c.charCodeAt(0),16777619); return h>>>0; }
export function phase(index,count) {
  if(count===1 || index===count-1) return {name:'내성 · 마지막 관문',scene:'keep',intro:'내성의 봉인이 모습을 드러냅니다. 원정대가 마지막 전선을 정리합니다.'};
  if(index===0) return {name:'외곽 방어선',scene:'outer',intro:'잿불 평원에 도착했습니다. 깃발 아래 원정대가 집결합니다.'};
  if(index/(count-1)<.5) return {name:'성벽으로의 진격',scene:'advance',intro:'외곽 방어선을 지나 성벽 아래로 길이 이어집니다.'};
  return {name:'북부 성문 · 돌파',scene:'wall',intro:'성문에 균열이 번집니다. 성벽 너머 내성이 보입니다.'};
}
const impacts=['공성추가 성문을 두드립니다. 균열 사이로 잿불이 튑니다.','화살이 어둠을 가릅니다. 적의 대열이 뒤로 물러납니다.','전위대가 방벽을 넘어 확보한 지점을 지킵니다.','마법의 봉인이 갈라집니다. 북쪽 길에 빛이 돌아옵니다.','공성포가 불을 뿜습니다. 오래된 돌이 성벽 아래로 떨어집니다.'];
const motions=['정찰병이 안개 사이로 돌아왔습니다. 새로운 진입로가 보입니다.','깃발이 바람을 받습니다. 병사들이 방패를 맞대고 전선을 유지합니다.','대장장이가 무너진 방벽을 보강합니다. 불씨가 어둠을 밝힙니다.','전령이 성벽 아래를 지나갑니다. 다음 관문으로 길이 이어집니다.'];
export function beat(run,exerciseIndex,ordinal,stage=0,priorSessions=0) {
  const seed=hash(`${run}:${exerciseIndex}:${ordinal}:${stage}:${priorSessions}`);
  return {id:`${run}:beat:${exerciseIndex}:${ordinal}`,impact:impacts[seed%impacts.length],motion:motions[(seed>>>4)%motions.length],buildup:'다음 관문이 시야에 들어옵니다. 원정대가 자리를 잡습니다.',phase:exerciseIndex};
}
export function ending(outcome,sets) {
  return outcome==='victory' ? {title:'북부 성벽을 되찾았습니다.',body:'무너진 성문 너머로 원정대가 진입했습니다. 내성의 봉인이 풀리고, 오랫동안 봉쇄되어 있던 북쪽 길이 다시 열렸습니다.'} : {title:'확보한 전선을 지키고 귀환했습니다.',body:sets?'원정대는 확보한 지점까지 전선을 정리하고 귀환했습니다. 오늘의 훈련은 세계의 역사로 남습니다.':'원정대가 야영지로 돌아왔습니다. 세계는 다음 여정을 기다립니다.'};
}
