(function(root){
'use strict';
let previousFingerprint='',previousRequestId='';
async function send(payload){
 const endpoint=root.APP_CONFIG?.APPS_SCRIPT_URL||'';
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(endpoint))throw new Error('Isi URL Web App /exec pada docs/config.js terlebih dahulu.');
 const options={method:payload?'POST':'GET',redirect:'follow',signal:AbortSignal.timeout(45000),credentials:'omit'};
 if(payload){options.headers={'Content-Type':'text/plain;charset=UTF-8'};options.body=JSON.stringify(payload)}
 let response;try{response=await fetch(payload?endpoint:endpoint+'?action=list&t='+Date.now(),options)}catch{throw new Error('Respons Apps Script belum terbaca. Periksa internet, URL /exec, dan izin Web App. Jika sedang menyimpan, periksa riwayat sebelum mengirim ulang.');}
 let result;try{result=await response.json()}catch{throw new Error('Respons bukan JSON. Pastikan deployment Web App menjalankan versi kode terbaru dan dapat diakses.');}
 if(!response.ok||result.success!==true)throw new Error(result.message||'Operasi belum terkonfirmasi.');
 return result;
}
async function request(payload){
 if(!payload){const r=await send();if(!Array.isArray(r.data))throw new Error('Format riwayat tidak sesuai.');return r;}
 const fingerprint=JSON.stringify(payload);
 if(fingerprint!==previousFingerprint){previousFingerprint=fingerprint;previousRequestId=crypto.randomUUID();}
 return send({action:'create',requestId:previousRequestId,data:payload});
}
root.ReportAPI={request,detail:(id,pin)=>send({action:'detail',id,pin})};
})(window);
