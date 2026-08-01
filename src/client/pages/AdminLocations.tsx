import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';

export default function AdminLocations() {
  const {id:eventId}=useParams();
  const [locations,setLocations]=useState<any[]>([]);
  const [hotels,setHotels]=useState<any[]>([]);
  const [opened,{open,close}]=useDisclosure(false);
  const [editId,setEditId]=useState<string|null>(null);
  const [form,setForm]=useState({name:'',description:'',floor:'',hotel_id:'',pin_x:0,pin_y:0});
  const load=async()=>{if(!eventId)return;try{setLocations(await(await fetch('/api/locations/'+eventId)).json());}catch{}try{setHotels(await fetch('/api/hotels').then(r=>r.json()));}catch{}};
  useEffect(()=>{load();},[eventId]);
  const save=async()=>{try{const body={...form,pin_x:form.pin_x||null,pin_y:form.pin_y||null};if(editId){await fetch('/api/locations/'+eventId+'/'+editId,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}else{await fetch('/api/locations/'+eventId,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}notifications.show({title:editId?'Updated':'Created',color:'green'});close();setEditId(null);load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  return(<div className="page-container">
    <div className="flex items-center justify-between mb-20"><h1 className="md3-headline-small m-0">Locations</h1><button className="md3-btn" onClick={()=>{setEditId(null);setForm({name:'',description:'',floor:'',hotel_id:'',pin_x:0,pin_y:0});open();}}><IconPlus size={18}/> Add</button></div>
    <div style={{overflowX:'auto'}}><table><thead><tr><th>Name</th><th>Floor</th><th>Hotel</th><th>Actions</th></tr></thead><tbody>
      {locations.map((l:any)=>(<tr key={l.id}><td><span className="md3-body-medium" style={{fontWeight:500}}>{l.name}</span><div className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>{l.description||''}</div></td><td><span className="md3-badge" style={{background:'var(--md-surface-container-high)',color:'var(--md-on-surface)'}}>{l.floor||'-'}</span></td><td><span className="md3-body-medium">{l.hotel_name||'-'}</span></td><td><div className="flex gap-4"><button className="md3-btn-text" style={{height:28,minWidth:28,padding:0}} onClick={()=>{setEditId(l.id);setForm({name:l.name,description:l.description||'',floor:l.floor||'',hotel_id:l.hotel_id||'',pin_x:l.pin_x||0,pin_y:l.pin_y||0});open();}}><IconEdit size={14}/></button><button className="md3-btn-text" style={{height:28,minWidth:28,padding:0,color:'var(--md-error)'}} onClick={async()=>{if(confirm('Delete?')){await fetch('/api/locations/'+eventId+'/'+l.id,{method:'DELETE'});load();}}}><IconTrash size={14}/></button></div></td></tr>))}
    </tbody></table></div>
    <Modal opened={opened} onClose={()=>{close();setEditId(null);}} title={editId?'Edit Location':'Add Location'} fullScreen><div className="flex flex-col gap-12">
      <TextInput label="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
      <Textarea label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
      <TextInput label="Floor" value={form.floor} onChange={e=>setForm({...form,floor:e.target.value})} />
      <Select label="Hotel" data={hotels.map((h:any)=>({value:h.id,label:h.name}))} value={form.hotel_id} onChange={v=>setForm({...form,hotel_id:v||''})} clearable />
      <NumberInput label="Map Pin X" value={form.pin_x} onChange={v=>setForm({...form,pin_x:Number(v)})} />
      <NumberInput label="Map Pin Y" value={form.pin_y} onChange={v=>setForm({...form,pin_y:Number(v)})} />
      <button className="md3-btn" style={{width:'100%'}} onClick={save}>{editId?'Update':'Create'}</button>
    </div></Modal>
  </div>);
}
