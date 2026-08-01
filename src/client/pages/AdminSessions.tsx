import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, TextInput, Textarea, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconCalendar } from '@tabler/icons-react';

export default function AdminSessions() {
  const {id:eventId}=useParams();
  const [sessions,setSessions]=useState<any[]>([]);
  const [locations,setLocations]=useState<any[]>([]);
  const [opened,{open,close}]=useDisclosure(false);
  const [editId,setEditId]=useState<string|null>(null);
  const [form,setForm]=useState({title:'',description:'',speaker_name:'',speaker_title:'',location_id:'',session_date:'',start_time:'',end_time:'',track:''});
  const load=async()=>{if(!eventId)return;try{setSessions((await(await fetch('/api/sessions/'+eventId)).json()) as any[]);}catch{}try{setLocations((await(await fetch('/api/locations/'+eventId)).json()) as any[]);}catch{}};
  useEffect(()=>{load();},[eventId]);
  const save=async()=>{try{if(editId){await fetch('/api/sessions/'+eventId+'/'+editId,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});}else{await fetch('/api/sessions/'+eventId,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});}notifications.show({title:editId?'Updated':'Created',message:editId?'Session details updated':'New session created',color:'green'});close();setEditId(null);load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  return(<div className="page-container">
    <div className="flex items-center justify-between mb-20"><h1 className="md3-headline-small m-0">Sessions</h1><button className="md3-btn" onClick={()=>{setEditId(null);setForm({title:'',description:'',speaker_name:'',speaker_title:'',location_id:'',session_date:'',start_time:'',end_time:'',track:''});open();}}><IconPlus size={18}/> Add</button></div>
    <div style={{overflowX:'auto'}}><table><thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Speaker</th><th>Location</th><th>Actions</th></tr></thead><tbody>
      {sessions.map((s:any)=>(<tr key={s.id}><td><span className="md3-body-medium">{s.session_date}</span></td><td><span className="md3-body-medium">{s.start_time}-{s.end_time}</span></td><td><span className="md3-body-medium" style={{fontWeight:500}}>{s.title}</span>{s.track&&<span className="md3-badge" style={{marginLeft:8,background:'var(--md-secondary-container)',color:'var(--md-on-secondary-container)'}}>{s.track}</span>}</td><td><span className="md3-body-medium">{s.speaker_name||'-'}</span></td><td><span className="md3-body-medium">{s.location_name||'-'}</span></td><td><div className="flex gap-4"><button className="md3-btn-text" style={{height:28,minWidth:28,padding:0}} onClick={()=>{setEditId(s.id);setForm({title:s.title,description:s.description||'',speaker_name:s.speaker_name||'',speaker_title:s.speaker_title||'',location_id:s.location_id||'',session_date:s.session_date,start_time:s.start_time,end_time:s.end_time,track:s.track||''});open();}}><IconEdit size={14}/></button><button className="md3-btn-text" style={{height:28,minWidth:28,padding:0,color:'var(--md-error)'}} onClick={async()=>{if(confirm('Delete?')){await fetch('/api/sessions/'+eventId+'/'+s.id,{method:'DELETE'});load();}}}><IconTrash size={14}/></button></div></td></tr>))}
    </tbody></table></div>
    <Modal opened={opened} onClose={()=>{close();setEditId(null);}} title={editId?'Edit Session':'Add Session'} fullScreen><div className="flex flex-col gap-12">
      <TextInput label="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
      <Textarea label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
      <TextInput label="Speaker" value={form.speaker_name} onChange={e=>setForm({...form,speaker_name:e.target.value})} />
      <TextInput label="Speaker Title" value={form.speaker_title} onChange={e=>setForm({...form,speaker_title:e.target.value})} />
      <Select label="Location" data={locations.map((l:any)=>({value:l.id,label:l.name}))} value={form.location_id} onChange={v=>setForm({...form,location_id:v||''})} searchable clearable />
      <div style={{display:'flex',gap:12}}><TextInput label="Date" type="date" value={form.session_date} onChange={e=>setForm({...form,session_date:e.target.value})} style={{flex:1}} /><TextInput label="Start" type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} style={{flex:1}} /><TextInput label="End" type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} style={{flex:1}} /></div>
      <TextInput label="Track" value={form.track} onChange={e=>setForm({...form,track:e.target.value})} />
      <button className="md3-btn" style={{width:'100%'}} onClick={save}>{editId?'Update':'Create'}</button>
    </div></Modal>
  </div>);
}
