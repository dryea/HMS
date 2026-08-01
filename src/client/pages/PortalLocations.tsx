import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconMapPin } from '@tabler/icons-react';

export default function PortalLocations() {
  const {token}=useParams();const nav=useNavigate();
  const [locations,setLocations]=useState<any[]>([]);
  useEffect(()=>{if(token)fetch('/api/portal/'+token+'/locations').then(r=>r.json()).then(setLocations).catch(()=>{});},[token]);
  return(<div className="page-container" style={{maxWidth:480}}>
    <div className="flex items-center gap-8 mb-20"><button className="md3-btn-text" onClick={()=>nav(-1)}><IconArrowLeft size={20}/></button><h1 className="md3-headline-small m-0">Locations</h1></div>
    {locations.map((l:any)=>(<div key={l.id} className="md3-card p-16 mb-12"><div className="flex items-center gap-8 mb-4"><IconMapPin size={18} style={{color:'var(--md-primary)'}}/><span className="md3-title-medium">{l.name}</span></div><p className="md3-body-medium m-0" style={{color:'var(--md-on-surface-variant)'}}>{l.description||''}</p><div className="flex gap-4 mt-4">{l.floor&&<span className="md3-badge" style={{background:'var(--md-surface-container-high)',color:'var(--md-on-surface)'}}>Floor {l.floor}</span>}{l.hotel_name&&<span className="md3-badge" style={{background:'var(--md-secondary-container)',color:'var(--md-on-secondary-container)'}}>{l.hotel_name}</span>}</div></div>))}
  </div>);
}
