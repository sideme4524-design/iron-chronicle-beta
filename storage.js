import {fresh,validate,migrate,clone} from './domain.js';
const DB='iron-chronicle-beta';
export class SaveStore {
  constructor(test=false){this.slot=test?'test':'real';this.test=test;this.db=null;this.revision=0;this.raw=null;}
  async open(){this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');r.onsuccess=()=>{r.result.onversionchange=()=>r.result.close();resolve(r.result);};r.onerror=()=>reject(Error('기기 저장소를 열지 못했습니다. 브라우저 저장 권한을 확인하세요.'));r.onblocked=()=>reject(Error('다른 창을 닫은 뒤 저장소를 다시 여세요.'));});return this;}
  read(key=this.slot){return new Promise((resolve,reject)=>{const tx=this.db.transaction('saves','readonly'),r=tx.objectStore('saves').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(Error('저장값을 읽지 못했습니다. 원본을 덮어쓰지 않습니다.'));});}
  async load(){const raw=await this.read();this.raw=raw;if(raw){const s=migrate(raw);if(s.meta.test!==this.test)throw Error('테스트/실제 저장 공간이 일치하지 않습니다.');this.revision=raw.meta?.revision??0;return s;}
    const legacy=this.test?null:localStorage.getItem('iron-chronicle-v1');
    if(legacy){this.raw=legacy;const s=migrate(JSON.parse(legacy));await this.write(s,{backupKey:this.slot+':legacy',backupValue:legacy});return s;}
    const s=fresh(Date.now(),this.test);await this.write(s);return s;
  }
  async write(next,{replace=false,backupKey,backupValue}={}) {
    validate(next);if(next.meta.test!==this.test)throw Error('테스트 기록을 실제 기록으로 가져올 수 없습니다.');const snapshot=clone(next),expected=this.revision;
    return new Promise((resolve,reject)=>{const tx=this.db.transaction('saves','readwrite'),store=tx.objectStore('saves'),get=store.get(this.slot);let reason='저장하지 못했습니다. 기존 기록은 유지됩니다.',done;
      get.onsuccess=()=>{const old=get.result,revision=old?.meta?.revision??0;if(!replace&&revision!==expected){reason='다른 창에서 저장값이 바뀌었습니다. 새로고침 후 계속하세요.';tx.abort();return;}
        snapshot.meta.revision=revision+1;if(old!==undefined)store.put(old,this.slot+':previous');if(backupKey)store.put(backupValue===undefined?old:backupValue,backupKey);store.put(snapshot,this.slot);done=snapshot;
      };tx.oncomplete=()=>{this.revision=done.meta.revision;this.raw=done;resolve(done);};tx.onabort=()=>reject(Error(reason));tx.onerror=()=>{reason='저장 공간 또는 트랜잭션 오류입니다. 기록을 백업하고 다시 시도하세요.';};
    });
  }
  async import(data){const s=migrate(data);if(s.meta.test!==this.test)throw Error('실제/테스트 저장 파일을 각각의 세계에서 불러오세요.');return this.write(s,{replace:true,backupKey:this.slot+':pre-import'});}
  async reset(){return this.write(fresh(Date.now(),this.test),{replace:true,backupKey:this.slot+':pre-reset'});}
  async recover(){const raw=await this.read(this.slot+':previous');if(!raw)throw Error('이전 저장본이 없습니다. JSON 백업을 불러오세요.');return this.import(raw);}
}
