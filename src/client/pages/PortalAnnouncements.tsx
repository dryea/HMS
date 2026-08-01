import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconBell } from '@tabler/icons-react';

export default function PortalAnnouncements() {
  const {token}=useParams();const nav=useNavigate();
  const [announcements,setAnnouncements]=useState<any[]>([]);
  useEffect(()=>{if(token){fetch('/api/portal/'+token+'/announcements').then(r=>r.json()).then((data: any)=>{setAnnouncements(data);data.forEach((a:any)=>{if(!a.is_read)fetch('/api/portal/'+token+'/announcements/'+a.id+'/read',{method:'POST'});});}).catch(()=>{});}},[token]);
  return(<div className="page-container" style={{maxWidth:480}}>
    <div className="flex items-center gap-8 mb-20"><button className="md3-btn-text" onClick={()=>nav(-1)}><IconArrowLeft size={20}/></button><h1 className="md3-headline-small m-0">Announcements</h1></div>
    {announcements.map((a:any)=>(<div key={a.id} className="md3-card p-16 mb-12" style={{opacity:a.is_read?0.6:1}}><div className="flex items-center gap-8 mb-4"><IconBell size={16} style={{color:'var(--md-primary)'}}/><span className="md3-title-medium">{a.title}</span>{a.priority==='high'&&<span className="md3-badge" style={{background:'var(--md-error)',color:'var(--md-on-error)'}}>High</span>}</div><p className="md3-body-medium m-0">{a.message}</p><p className="md3-body-small mt-4" style={{color:'var(--md-on-surface-variant)'}}>{a.created_at}</p></div>))}
  </div>);
}
