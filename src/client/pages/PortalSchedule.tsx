import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconBookmark, IconBookmarkFilled, IconMapPin, IconUser } from '@tabler/icons-react';

export default function PortalSchedule() {
  const {token}=useParams();const nav=useNavigate();
  const [data,setData]=useState<any>(null);const [mySessions,setMySessions]=useState(false);const [filterTrack,setFilterTrack]=useState('');
  const load=()=>{if(token)fetch('/api/portal/'+token+'/sessions').then(r=>r.json()).then(setData).catch(()=>{});};
  useEffect(()=>{load();},[token]);
  const toggleBookmark=async(sid:string)=>{await fetch('/api/portal/'+token+'/bookmark',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:sid})});load();};
  if(!data)return<div className="page-container"><p>Loading...</p></div>;
  let sessions=data.sessions||[];if(mySessions)sessions=sessions.filter((s:any)=>s.booked);
  const byDate:Record<string,any[]>={};for(const s of sessions){if(!byDate[s.session_date])byDate[s.session_date]=[];byDate[s.session_date].push(s);}
  return(<div className="page-container" style={{maxWidth:480}}>
    <div className="flex items-center gap-8 mb-20"><button className="md3-btn-text" onClick={()=>nav(-1)}><IconArrowLeft size={20}/></button><h1 className="md3-headline-small m-0" style={{flex:1}}>Schedule</h1><button className={'md3-chip'} data-selected={mySessions} onClick={()=>setMySessions(!mySessions)}>My Schedule</button></div>
    {Object.entries(byDate).length===0?<div className="md3-card p-24" style={{textAlign:'center'}}><p className="md3-body-medium" style={{color:'var(--md-on-surface-variant)'}}>{mySessions?'No bookmarked sessions':'No sessions'}</p></div>:Object.entries(byDate).map(([date,sList])=>(<div key={date} className="mb-16"><p className="md3-title-medium m-0 mb-8">{date}</p>{sList.map((s:any)=>(<div key={s.id} className="md3-card p-12 mb-8">
      <div className="flex items-start justify-between"><div style={{flex:1}}><div className="flex items-center gap-4"><span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>{s.start_time}-{s.end_time}</span>{s.track&&<span className="md3-badge" style={{background:'var(--md-secondary-container)',color:'var(--md-on-secondary-container)'}}>{s.track}</span>}</div>
        <p className="md3-body-medium m-0" style={{fontWeight:500}}>{s.title}</p>
        <div className="flex items-center gap-8 mt-2">{s.speaker_name&&<span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}><IconUser size={12} style={{verticalAlign:'middle',marginRight:4}}/>{s.speaker_name}</span>}{s.location_name&&<span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}><IconMapPin size={12} style={{verticalAlign:'middle',marginRight:4}}/>{s.location_name}</span>}</div>
      </div><button className="md3-btn-text" style={{height:32,width:32,padding:0}} onClick={()=>toggleBookmark(s.id)}>{s.booked?<IconBookmarkFilled size={18} style={{color:'var(--md-primary)'}}/>:<IconBookmark size={18}/>}</button></div>
    </div>))}</div>))}
  </div>);
}
