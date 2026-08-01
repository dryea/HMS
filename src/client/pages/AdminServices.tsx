import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TextInput, Card, Text, Badge, Select, SimpleGrid, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconCopy } from '@tabler/icons-react';

export default function AdminServices() {
  const {id:eventId}=useParams();
  const [dates,setDates]=useState<any[]>([]);
  const [types,setTypes]=useState<any[]>([]);
  const [hotels,setHotels]=useState<any[]>([]);
  const [selectedDate,setSelectedDate]=useState('');
  const [services,setServices]=useState<any[]>([]);
  const load=async()=>{if(!eventId)return;try{setDates(await(await fetch('/api/services/'+eventId+'/dates')).json());}catch{}try{setTypes(await(await fetch('/api/services/types')).json());}catch{}try{setHotels(await fetch('/api/hotels').then(r=>r.json()));}catch{}};
  useEffect(()=>{load();},[eventId]);
  const addDate=()=>{if(!selectedDate)return;setServices([...services,{date:selectedDate,entries:types.map(t=>({hotel_id:hotels[0]?.id||'',type_id:t.id,start_time:'',end_time:''}))}]);setSelectedDate('');};
  const saveDate=async(date:string)=>{const entry=services.find(s=>s.date===date);if(!entry)return;try{await fetch('/api/services/'+eventId+'/dates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({date,services:entry.entries})});notifications.show({title:'Services saved',message:'Services saved for '+date,color:'green'});load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  return(<div className="page-container">
    <h1 className="md3-headline-small m-0 mb-20">Service Schedule</h1>
    <div className="flex gap-8 mb-20"><input type="date" className="md3-text-field" style={{minHeight:40,padding:'0 12px'}} value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} /><button className="md3-btn" onClick={addDate}><IconPlus size={18}/> Add Date</button></div>
    {services.map((entry:any)=>(<div key={entry.date} className="md3-card p-16 mb-12">
      <div className="flex items-center gap-8 mb-12"><span className="md3-title-medium">{entry.date}</span><button className="md3-btn-text" style={{height:32}} onClick={()=>{const idx=services.findIndex(s=>s.date===entry.date);if(idx>0){setServices(services.map((s,i)=>i===idx?{...s,entries:services[idx-1].entries.map((e:any)=>({...e}))}:s));}}}><IconCopy size={14}/> Copy Prev</button><button className="md3-btn" style={{height:32,padding:'0 16px',marginLeft:'auto'}} onClick={()=>saveDate(entry.date)}>Save</button></div>
      {entry.entries.map((svc:any,i:number)=>(<div key={i} className="flex items-center gap-8 mb-4" style={{flexWrap:'wrap'}}>
        <span className="md3-badge" style={{background:'var(--md-secondary-container)',color:'var(--md-on-secondary-container)'}}>{types.find(t=>t.id===svc.type_id)?.name||svc.type_id}</span>
        <Select size="xs" data={hotels.map((h:any)=>({value:h.id,label:h.name}))} value={svc.hotel_id} onChange={v=>{const e=[...entry.entries];e[i]={...e[i],hotel_id:v||''};setServices(services.map(s=>s.date===entry.date?{...s,entries:e}:s));}} searchable style={{minWidth:160}} />
        <input type="time" className="md3-text-field" style={{minHeight:32,padding:'0 8px',width:100}} value={svc.start_time} onChange={e=>{const es=[...entry.entries];es[i]={...es[i],start_time:e.target.value};setServices(services.map(s=>s.date===entry.date?{...s,entries:es}:s));}} />
        <input type="time" className="md3-text-field" style={{minHeight:32,padding:'0 8px',width:100}} value={svc.end_time} onChange={e=>{const es=[...entry.entries];es[i]={...es[i],end_time:e.target.value};setServices(services.map(s=>s.date===entry.date?{...s,entries:es}:s));}} />
      </div>))}
    </div>))}
  </div>);
}
