(function(){
"use strict";
let userId=null,busy=false,queued=false,timer=null,lastSyncError="";
const api=()=>window.CalexProductivity;
const status=s=>api()?.setStatus(s);
const stamp=()=>new Date().toISOString();
const collections=["tasks","lists","habits","notes","countdowns","sessions","templates","archived","deleted"];
const idOf=x=>String(x?.id||x?.date||x?.createdAt||JSON.stringify(x));
const timeOf=x=>Date.parse(x?.updatedAt||x?.deletedAt||x?.archivedAt||x?.createdAt||x?.date||"")||0;
function mergeArray(local,remote){const map=new Map();for(const item of [...(remote||[]),...(local||[])]){const id=idOf(item),old=map.get(id);if(!old||timeOf(item)>=timeOf(old))map.set(id,item);}return [...map.values()];}
function mergeData(local,remote){const out={...remote,...local};for(const key of collections)out[key]=mergeArray(local?.[key],remote?.[key]);out.settings={...(remote?.settings||{}),...(timeOf(local?.settings)>=timeOf(remote?.settings)?local?.settings:remote?.settings||{})};const tombs=new Map((out.deleted||[]).map(t=>[t.id,timeOf(t)]));out.tasks=(out.tasks||[]).filter(t=>!tombs.has(t.id)||timeOf(t)>tombs.get(t.id));return out;}
async function syncNow(){const p=api(),client=window.CalexSupabaseClient;if(!p||!client||!userId||busy||!navigator.onLine)return;busy=true;queued=false;try{const {data:row,error}=await client.from("calex_productivity").select("productivity_data,updated_at").eq("user_id",userId).maybeSingle();if(error)throw error;let merged;if(row?.productivity_data){merged=mergeData(p.data,row.productivity_data);Object.keys(p.data).forEach(k=>delete p.data[k]);Object.assign(p.data,merged);p.save(true);}else merged=p.data;const {error:writeError}=await client.from("calex_productivity").upsert({user_id:userId,productivity_data:merged,updated_at:stamp()},{onConflict:"user_id"});if(writeError)throw writeError;lastSyncError="";status("Tasks synced to your Calex account.");}catch(error){const message=String(error?.message||error);if(!lastSyncError){status(/calex_productivity|schema cache|relation .* does not exist/i.test(message)?"Cloud sync needs the Calex productivity database migration. Local data is safe.":"Cloud sync unavailable. Local data is safe.");lastSyncError=message;}console.warn("Calex productivity sync:",message);}finally{busy=false;if(queued)schedule();}}
function schedule(){if(!userId)return;if(busy){queued=true;return;}clearTimeout(timer);timer=setTimeout(syncNow,1200);}
function onAuth(){const client=window.CalexSupabaseClient;if(!client)return;client.auth.getSession().then(({data,error})=>{if(error)throw error;const next=data?.session?.user?.id||null;if(next!==userId){userId=next;lastSyncError="";if(userId)syncNow();}}).catch(e=>{console.warn("Could not read Calex productivity sync session",e);});}
window.addEventListener("calex:auth",onAuth);
window.addEventListener("calex:productivity-saved",schedule);
window.addEventListener("online",schedule);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")schedule();});
document.addEventListener("DOMContentLoaded",onAuth);
window.CalexProductivitySync={syncNow,get signedIn(){return !!userId;}};
})();