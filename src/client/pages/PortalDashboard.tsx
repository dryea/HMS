import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconCalendar, IconMap, IconBell, IconClipboardCheck, IconDownload, IconBuilding, IconBed, IconShare, IconClock } from '@tabler/icons-react';
import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function PortalDashboard() {
  const {token}=useParams();const nav=useNavigate();
  const [data,setData]=useState<any>(null);const [countdown,setCountdown]=useState('');const [shareOpened,{open:openShare,close:closeShare}]=useDisclosure(false);
  useEffect(()=>{if(token)fetch('/api/portal/'+token).then(r=>r.json()).then(setData).catch(()=>{});},[token]);
  useEffect(()=>{if(!data?.participant)return;const end=new Date(data.participant.start_date).getTime();const update=()=>{const diff=end-Date.now();if(diff<=0){setCountdown('Event started!');return;}const d=Math.floor(diff/(1000*60*60*24)),h=Math.floor((diff/(1000*60*60))%24);setCountdown(`${d}d ${h}h`);};update();const i=setInterval(update,60000);return()=>clearInterval(i);},[data]);
  if(!data)return<div className="page-container"><p>Loading...</p></div>;
  const p=data.participant;
  return(<div className="page-container" style={{maxWidth:480}}>
    <div className="md3-card p-24 mb-16" style={{background:`linear-gradient(135deg, ${p.banner_color||'var(--md-surface-container-low)'}, ${p.accent_color||'var(--md-primary)'})`,color:'white'}}>
      <h2 className="md3-title-large m-0">{p.event_name}</h2>
      <p className="md3-body-medium m-0 mt-4" style={{opacity:0.9}}>{p.start_date} to {p.end_date}</p>
      {countdown&&<p className="md3-body-small mt-4" style={{opacity:0.8}}><IconClock size={12} style={{verticalAlign:'middle',marginRight:4}}/>{countdown}</p>}
    </div>
    <div className="md3-card p-24 mb-16" style={{textAlign:'center'}}>
      <h3 className="md3-title-large m-0 mb-12">{p.name}</h3>
      <img src={'/api/qr/'+token+'/image'} style={{width:200,height:200,borderRadius:16,margin:'0 auto',display:'block'}} alt="QR" />
      <div className="flex gap-8 mt-12 justify-center"><button className="md3-btn-outlined" onClick={()=>openShare()}><IconShare size={18}/> Share</button><a className="md3-btn" style={{textDecoration:'none'}} href={'/api/qr/'+token+'/image'} download><IconDownload size={18}/> Download</a></div>
    </div>
    {p.hotel_name&&<div className="md3-card p-16 mb-16"><div className="flex items-center gap-8 mb-4"><IconBuilding size={18} style={{color:'var(--md-primary)'}}/><span className="md3-title-medium">{p.hotel_name}</span></div><p className="md3-body-medium m-0" style={{color:'var(--md-on-surface-variant)'}}>{p.hotel_address}</p><div className="flex items-center gap-4 mt-4"><IconBed size={14} style={{color:'var(--md-on-surface-variant)'}}/><span className="md3-body-medium">Room {p.room_number} / {p.bed_label}</span></div><span className="md3-badge mt-8" style={{background:p.status==='checked_in'?'var(--md-tertiary)':p.status==='arrived'?'var(--md-primary-container)':'var(--md-surface-container-high)',color:p.status==='checked_in'?'var(--md-on-tertiary)':p.status==='arrived'?'var(--md-on-primary-container)':'var(--md-on-surface)'}}>{p.status}</span></div>}
    <div className="stat-grid">
      {[
        {icon:IconCalendar,label:'Schedule',path:'schedule'},{icon:IconMap,label:'Locations',path:'locations'},
        {icon:IconBell,label:'Updates',path:'announcements'},{icon:IconClipboardCheck,label:'Feedback',path:'survey'},
      ].map((item,i)=><div key={item.label} className="md3-card p-16" style={{cursor:'pointer',textAlign:'center'}} onClick={()=>nav(item.path)}><item.icon size={28} style={{color:'var(--md-primary)'}}/><p className="md3-body-medium m-0 mt-4">{item.label}</p></div>)}
    </div>
    <Modal opened={shareOpened} onClose={closeShare} title="Share QR" centered><div className="flex flex-col gap-8">
      <a className="md3-btn" style={{textDecoration:'none'}} href={'https://wa.me/'+(p.phone||'').replace(/[^0-9]/g,'')+'?text='+encodeURIComponent(window.location.href)} target="_blank">WhatsApp</a>
      <a className="md3-btn-outlined" style={{textDecoration:'none',textAlign:'center'}} href={'sms:'+p.phone+'?body='+encodeURIComponent(window.location.href)}>SMS</a>
      <button className="md3-btn-text" onClick={()=>{navigator.clipboard.writeText(window.location.href);closeShare();}}>Copy Link</button>
    </div></Modal>
  </div>);
}
