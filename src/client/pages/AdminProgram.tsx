import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, TextInput, Textarea, Select, Switch } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconClock, IconMapPin, IconUser, IconCheck } from '@tabler/icons-react';

const PROGRAM_TYPES = ['RMC','BMC','Training','Ceremony','Entertainment','Conference','Workshop','Session'];

export default function AdminProgram() {
  const {id:eventId}=useParams();
  const nav=useNavigate();
  const [event,setEvent]=useState<any>(null);
  const [sessions,setSessions]=useState<any[]>([]);
  const [dates,setDates]=useState<string[]>([]);
  const [activeDate,setActiveDate]=useState('');
  const [locations,setLocations]=useState<any[]>([]);
  const [services,setServices]=useState<any[]>([]);
  const [showMeals,setShowMeals]=useState(true);
  const [opened,{open,close}]=useDisclosure(false);
  const [editId,setEditId]=useState<string|null>(null);
  const [form,setForm]=useState({title:'',subtitle:'',description:'',speaker_name:'',speaker_title:'',location_id:'',session_date:'',start_time:'',end_time:'',track:'',session_type:'',items:''});

  const load=async()=>{
    if(!eventId)return;
    try{const ev=await(await fetch('/api/events/'+eventId)).json();setEvent(ev);const start=new Date(ev.start_date),end=new Date(ev.end_date),ds:string[]=[];for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1))ds.push(d.toISOString().split('T')[0]);setDates(ds);if(!activeDate&&ds.length)setActiveDate(ds[0]);}catch{}
    try{setSessions(await(await fetch('/api/sessions/'+eventId)).json());}catch{}
    try{setLocations(await(await fetch('/api/locations/'+eventId)).json());}catch{}
    try{setServices(await(await fetch('/api/services/'+eventId+'/dates')).json());}catch{}
  };
  useEffect(()=>{load();},[eventId]);

  const daySessions=sessions.filter((s:any)=>s.session_date===activeDate).sort((a:any,b:any)=>a.start_time.localeCompare(b.start_time));
  const dayServices=(services.find((d:any)=>d.date===activeDate)?.services||[]).sort((a:any,b:any)=>(a.start_time||'').localeCompare(b.start_time||''));

  const parseItems=(str:string)=>str.split('\n').filter(l=>l.trim()).map(l=>{const parts=l.split('~');return{title:parts[0].trim(),description:parts[1]?.trim()||''}});

  const save=async()=>{
    const body={...form,items:parseItems(form.items),session_type:form.session_type||'session'};
    try{
      if(editId){await fetch('/api/sessions/'+eventId+'/'+editId,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}
      else{await fetch('/api/sessions/'+eventId,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}
      notifications.show({title:editId?'Updated':'Created',color:'green'});close();setEditId(null);load();
    }catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}
  };

  return(<div className="page-container" style={{maxWidth:680}}>
    <div className="flex items-center justify-between mb-16" style={{flexWrap:'wrap',gap:8}}>
      <div><h1 className="md3-headline-small m-0">Program Schedule</h1>
        {event?.dress_code&&<p className="md3-body-small m-0 mt-4" style={{color:'var(--md-on-surface-variant)'}}>👔 {event.dress_code}</p>}
      </div>
      <button className="md3-btn" onClick={()=>{setEditId(null);setForm({title:'',subtitle:'',description:'',speaker_name:'',speaker_title:'',location_id:'',session_date:activeDate,start_time:'',end_time:'',track:'',session_type:'',items:''});open();}}><IconPlus size={18}/> Add</button>
    </div>

    {dates.length>1&&<div className="flex gap-4 mb-16" style={{overflowX:'auto'}}>{dates.map(d=><button key={d} className="md3-chip" data-selected={activeDate===d} onClick={()=>setActiveDate(d)} style={{whiteSpace:'nowrap'}}>{new Date(d).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}</button>)}</div>}

    <div className="flex items-center gap-8 mb-16"><Switch label="Show Meals" checked={showMeals} onChange={e=>setShowMeals(e.currentTarget.checked)} /></div>

    {showMeals&&dayServices.map((svc:any)=>(<div key={svc.id} className="md3-card p-16 mb-8" style={{background:'var(--md-secondary-container)'}}>
      <div className="flex items-center gap-8"><IconCheck size={18} style={{color:'var(--md-on-secondary-container)'}}/><span className="md3-title-medium" style={{color:'var(--md-on-secondary-container)'}}>{svc.service_name}</span><span className="md3-body-small" style={{color:'var(--md-on-secondary-container)'}}>{svc.start_time||''}{svc.end_time?`-${svc.end_time}`:''}</span></div>
      {svc.menu_items?.length>0&&<div className="flex gap-4 mt-8 flex-wrap">{(svc.menu_items||[]).map((m:any,i:number)=><span key={i} className="md3-chip" style={{cursor:'default',background:'var(--md-on-secondary-container)',color:'var(--md-secondary-container)',borderColor:'transparent'}}>{m}</span>)}</div>}
    </div>))}

    {daySessions.length===0&&!showMeals?(<div className="md3-card p-24" style={{textAlign:'center'}}><p className="md3-body-medium" style={{color:'var(--md-on-surface-variant)'}}>No sessions for {activeDate}</p></div>):<div className="flex flex-col gap-12">{daySessions.map((s:any)=>(
      <div key={s.id} className="md3-card p-16">
        <div className="flex items-start justify-between">
          <div style={{flex:1}}>
            <div className="flex items-center gap-4 mb-4">
              <span className="md3-badge" style={{background:'var(--md-primary-container)',color:'var(--md-on-primary-container)'}}><IconClock size={12} style={{verticalAlign:'middle',marginRight:4}}/>{s.start_time}-{s.end_time}</span>
              {s.session_type&&<span className="md3-badge" style={{background:'var(--md-tertiary-container)',color:'var(--md-on-tertiary-container)'}}>{s.session_type}</span>}
              {s.track&&<span className="md3-badge" style={{background:'var(--md-secondary-container)',color:'var(--md-on-secondary-container)'}}>{s.track}</span>}
            </div>
            <span className="md3-title-medium">{s.title}</span>
            {s.subtitle&&<p className="md3-body-small m-0 mt-4" style={{color:'var(--md-on-surface-variant)'}}>{s.subtitle}</p>}
            {s.description&&<p className="md3-body-medium m-0 mt-4" style={{color:'var(--md-on-surface-variant)'}}>{s.description}</p>}
            <div className="flex gap-12 mt-4 flex-wrap">{s.speaker_name&&<span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}><IconUser size={12} style={{verticalAlign:'middle',marginRight:4}}/>{s.speaker_name}</span>}{s.location_name&&<span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}><IconMapPin size={12} style={{verticalAlign:'middle',marginRight:4}}/>{s.location_name}</span>}</div>
            {(s.items||[]).length>0&&<div className="mt-8" style={{borderLeft:'2px solid var(--md-outline-variant)',paddingLeft:12}}>{(s.items||[]).map((it:any,i:number)=>(<div key={i} className="mb-4"><span className="md3-body-small" style={{fontWeight:500}}>• {it.title}</span>{it.description&&<span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}> — {it.description}</span>}</div>))}</div>}
          </div>
          <div className="flex gap-4">
            <button className="md3-btn-text" style={{height:32,width:32,padding:0}} onClick={()=>{setEditId(s.id);setForm({title:s.title,subtitle:s.subtitle||'',description:s.description||'',speaker_name:s.speaker_name||'',speaker_title:s.speaker_title||'',location_id:s.location_id||'',session_date:s.session_date,start_time:s.start_time,end_time:s.end_time,track:s.track||'',session_type:s.session_type||'',items:(s.items||[]).map((it:any)=>it.title+(it.description?'~'+it.description:'')).join('\n')});open();}}><IconEdit size={16}/></button>
            <button className="md3-btn-text" style={{height:32,width:32,padding:0,color:'var(--md-error)'}} onClick={async()=>{if(confirm('Delete?')){await fetch('/api/sessions/'+eventId+'/'+s.id,{method:'DELETE'});load();}}}><IconTrash size={16}/></button>
          </div>
        </div>
      </div>
    ))}</div>}

    <Modal opened={opened} onClose={()=>{close();setEditId(null);}} title={editId?'Edit Session':'Add Session'} fullScreen><div className="flex flex-col gap-12">
      <TextInput label="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
      <TextInput label="Subtitle" value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})} />
      <Textarea label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
      <TextInput label="Speaker" value={form.speaker_name} onChange={e=>setForm({...form,speaker_name:e.target.value})} />
      <TextInput label="Speaker Title" value={form.speaker_title} onChange={e=>setForm({...form,speaker_title:e.target.value})} />
      <Select label="Program Type" data={PROGRAM_TYPES} value={form.session_type} onChange={v=>setForm({...form,session_type:v||''})} searchable />
      <Select label="Location" data={locations.map((l:any)=>({value:l.id,label:l.name}))} value={form.location_id} onChange={v=>setForm({...form,location_id:v||''})} searchable clearable />
      <div style={{display:'flex',gap:12}}><TextInput label="Date" type="date" value={form.session_date} onChange={e=>setForm({...form,session_date:e.target.value})} style={{flex:1}}/><TextInput label="Start" type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} style={{flex:1}}/><TextInput label="End" type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} style={{flex:1}}/></div>
      <TextInput label="Track" value={form.track} onChange={e=>setForm({...form,track:e.target.value})} />
      <div><p className="md3-label-medium mb-4">Program Items (one per line: Title~Description)</p><Textarea value={form.items} onChange={e=>setForm({...form,items:e.target.value})} placeholder="National Anthem~By CEO sir&#10;Lighting&#10;Opening Remarks~By DGM sir" minRows={4} /></div>
      <button className="md3-btn" style={{width:'100%'}} onClick={save}>{editId?'Update':'Create'}</button>
    </div></Modal>
  </div>);
}
