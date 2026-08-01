import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, TextInput, Textarea, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconCalendar, IconClock, IconMapPin, IconUser } from '@tabler/icons-react';

export default function AdminSchedulePlanner() {
  const {id:eventId}=useParams();
  const [event,setEvent]=useState<any>(null);
  const [sessions,setSessions]=useState<any[]>([]);
  const [dates,setDates]=useState<string[]>([]);
  const [activeDate,setActiveDate]=useState('');
  const [locations,setLocations]=useState<any[]>([]);
  const [opened,{open,close}]=useDisclosure(false);
  const [editId,setEditId]=useState<string|null>(null);
  const [form,setForm]=useState({title:'',description:'',speaker_name:'',speaker_title:'',location_id:'',session_date:'',start_time:'',end_time:'',track:''});
  const load=async()=>{if(!eventId)return;try{const ev: any =await(await fetch('/api/events/'+eventId)).json();setEvent(ev);const start=new Date(ev.start_date),end=new Date(ev.end_date),ds:string[]=[];for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1))ds.push(d.toISOString().split('T')[0]);setDates(ds);if(!activeDate&&ds.length)setActiveDate(ds[0]);}catch{}try{setSessions((await(await fetch('/api/sessions/'+eventId)).json()) as any[]);}catch{}try{setLocations((await(await fetch('/api/locations/'+eventId)).json()) as any[]);}catch{}};
  useEffect(()=>{load();},[eventId]);
  const daySessions=sessions.filter((s:any)=>s.session_date===activeDate).sort((a:any,b:any)=>a.start_time.localeCompare(b.start_time));
  const save=async()=>{try{if(editId){await fetch('/api/sessions/'+eventId+'/'+editId,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});}else{await fetch('/api/sessions/'+eventId,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});}notifications.show({title:editId?'Updated':'Created',message:editId?'Session details updated':'New session created',color:'green'});close();setEditId(null);load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  return(<div className="page-container">
    <div className="flex items-center justify-between mb-20"><h1 className="md3-headline-small m-0">Schedule Planner</h1><button className="md3-btn" onClick={()=>{setEditId(null);setForm({title:'',description:'',speaker_name:'',speaker_title:'',location_id:'',session_date:activeDate,start_time:'',end_time:'',track:''});open();}}><IconPlus size={18}/> Add Session</button></div>
    {dates.length>1&&<div className="flex gap-4 mb-16" style={{overflowX:'auto'}}>{dates.map(d=><button key={d} className="md3-chip" data-selected={activeDate===d} onClick={()=>setActiveDate(d)} style={{whiteSpace:'nowrap'}}>{new Date(d).toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}</button>)}</div>}
    {daySessions.length===0?(<div className="md3-card p-24" style={{textAlign:'center'}}><IconCalendar size={48} style={{opacity:0.3,marginBottom:16}}/><p className="md3-title-medium m-0 mb-8">No sessions for {activeDate}</p><button className="md3-btn" onClick={()=>{setEditId(null);setForm({title:'',description:'',speaker_name:'',speaker_title:'',location_id:'',session_date:activeDate,start_time:'',end_time:'',track:''});open();}}>Add Session</button></div>):<div className="flex flex-col gap-12">{daySessions.map((s:any)=>(<div key={s.id} className="md3-card p-16">
      <div className="flex items-start justify-between"><div className="flex flex-col gap-4" style={{flex:1}}>
        <div className="flex items-center gap-4"><span className="md3-badge" style={{background:'var(--md-primary-container)',color:'var(--md-on-primary-container)'}}><IconClock size={12} style={{verticalAlign:'middle',marginRight:4}}/>{s.start_time}-{s.end_time}</span>{s.track&&<span className="md3-badge" style={{background:'var(--md-secondary-container)',color:'var(--md-on-secondary-container)'}}>{s.track}</span>}</div>
        <span className="md3-title-medium">{s.title}</span>
        {s.description&&<p className="md3-body-medium m-0" style={{color:'var(--md-on-surface-variant)'}}>{s.description}</p>}
        <div className="flex gap-12">{s.speaker_name&&<span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}><IconUser size={12} style={{verticalAlign:'middle',marginRight:4}}/>{s.speaker_name}</span>}{s.location_name&&<span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}><IconMapPin size={12} style={{verticalAlign:'middle',marginRight:4}}/>{s.location_name}</span>}</div>
      </div><div className="flex gap-4"><button className="md3-btn-text" style={{height:32,minWidth:32,padding:4}} onClick={()=>{setEditId(s.id);setForm({title:s.title,description:s.description||'',speaker_name:s.speaker_name||'',speaker_title:s.speaker_title||'',location_id:s.location_id||'',session_date:s.session_date,start_time:s.start_time,end_time:s.end_time,track:s.track||''});open();}}><IconEdit size={16}/></button><button className="md3-btn-text" style={{height:32,minWidth:32,padding:4,color:'var(--md-error)'}} onClick={async()=>{if(confirm('Delete?')){await fetch('/api/sessions/'+eventId+'/'+s.id,{method:'DELETE'});load();}}}><IconTrash size={16}/></button></div></div>
    </div>))}</div>}
    <Modal opened={opened} onClose={()=>{close();setEditId(null);}} title={editId?'Edit Session':'Add Session'} fullScreen><div className="flex flex-col gap-12">
      <TextInput label="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
      <Textarea label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
      <TextInput label="Speaker" value={form.speaker_name} onChange={e=>setForm({...form,speaker_name:e.target.value})} />
      <Select label="Location" data={locations.map((l:any)=>({value:l.id,label:l.name}))} value={form.location_id} onChange={v=>setForm({...form,location_id:v||''})} searchable clearable />
      <div style={{display:'flex',gap:12}}><TextInput label="Date" type="date" value={form.session_date} onChange={e=>setForm({...form,session_date:e.target.value})} style={{flex:1}}/><TextInput label="Start" type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} style={{flex:1}}/><TextInput label="End" type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} style={{flex:1}}/></div>
      <TextInput label="Track" value={form.track} onChange={e=>setForm({...form,track:e.target.value})} />
      <button className="md3-btn" style={{width:'100%'}} onClick={save}>{editId?'Update':'Create'}</button>
    </div></Modal>
  </div>);
}
