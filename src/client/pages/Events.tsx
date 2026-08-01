import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconBuilding, IconMapPin, IconEdit, IconTrash } from '@tabler/icons-react';
import { api } from '../api/client';
import { Modal, TextInput, Checkbox, Divider, Skeleton } from '@mantine/core';

export default function Events() {
  const nav = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, {open,close}] = useDisclosure(false);
  const [editEvent, setEditEvent] = useState<any>(null);
  const [form, setForm] = useState({name:'',description:'',start_date:'',end_date:'',event_code:'',hotel_name:'',hotel_address:'',contact_person:'',contact_phone:''});
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [createNewHotel, setCreateNewHotel] = useState(false);

  const load = async () => { setLoading(true); try { setEvents(await api.events.list()); } catch {} try { setHotels(await fetch('/api/hotels').then(r=>r.json())); } catch {} setLoading(false); };
  useEffect(() => { load(); }, []);

  const copyCode = (code:string)=>{navigator.clipboard.writeText(code);notifications.show({title:'Copied: '+code,color:'blue'});};

  if(loading) return <div className="page-container">{[1,2].map(i=><Skeleton key={i} height={160} radius={16} mb={12} />)}</div>;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-20">
        <h1 className="md3-headline-small m-0">Events</h1>
        <button className="md3-btn" onClick={()=>{setEditEvent(null);setForm({name:'',description:'',start_date:'',end_date:'',event_code:'',hotel_name:'',hotel_address:'',contact_person:'',contact_phone:''});setSelectedHotels([]);setCreateNewHotel(false);open();}}><IconPlus size={18}/> New</button>
      </div>
      {events.length===0 ? (
        <div className="md3-card p-24" style={{textAlign:'center'}}>
          <IconBuilding size={48} style={{opacity:0.3,marginBottom:16}}/>
          <p className="md3-title-medium m-0 mb-8">No events yet</p>
          <button className="md3-btn" onClick={()=>{setEditEvent(null);setForm({name:'',description:'',start_date:'',end_date:'',event_code:'',hotel_name:'',hotel_address:'',contact_person:'',contact_phone:''});setSelectedHotels([]);setCreateNewHotel(false);open();}}>Create Event</button>
        </div>
      ) : (
      <div className="flex flex-col gap-12">
        {events.map((e:any)=>(
          <div key={e.id} className="md3-card p-20" style={{cursor:'pointer'}} onClick={()=>nav('/admin/events/'+e.id)}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-8"><IconBuilding size={20} style={{color:'var(--md-primary)'}}/><span className="md3-title-medium">{e.name}</span></div>
              <div className="flex gap-4">
                <button className="md3-btn-text" style={{height:32,minWidth:32,padding:4}} onClick={(ev)=>{ev.stopPropagation();setEditEvent(e);setForm({name:e.name,description:e.description||'',start_date:e.start_date,end_date:e.end_date,event_code:e.event_code,hotel_name:'',hotel_address:'',contact_person:'',contact_phone:''});setSelectedHotels([]);open();}}><IconEdit size={16}/></button>
                <button className="md3-btn-text" style={{height:32,minWidth:32,padding:4,color:'var(--md-error)'}} onClick={async(ev)=>{ev.stopPropagation();if(confirm('Delete?')){await api.events.delete(e.id);load();}}}><IconTrash size={16}/></button>
              </div>
            </div>
            <p className="md3-body-medium m-0" style={{color:'var(--md-on-surface-variant)'}}>{e.description}</p>
            <p className="md3-body-small mt-4" style={{color:'var(--md-on-surface-variant)'}}>{e.start_date} to {e.end_date}</p>
            <div className="flex gap-4 mt-8 flex-wrap">
              {(e.hotels||[]).map((h:any)=><span key={h.id} className="md3-chip" style={{background:'var(--md-primary-container)',borderColor:'transparent',color:'var(--md-on-primary-container)'}}>{h.name}{h.staff_code&&<span style={{cursor:'pointer',marginLeft:4}} onClick={(ev)=>{ev.stopPropagation();copyCode(h.staff_code);}}>📋</span>}</span>)}
            </div>
            <div className="flex gap-4 mt-8"><span className="md3-badge">{e.event_code}</span></div>
            <div className="flex gap-8 mt-12">
              <button className="md3-btn-outlined" style={{height:32,padding:'0 12px',fontSize:12}} onClick={(ev)=>{ev.stopPropagation();nav('/admin/events/'+e.id+'/dashboard')}}>Dashboard</button>
              <button className="md3-btn-outlined" style={{height:32,padding:'0 12px',fontSize:12}} onClick={(ev)=>{ev.stopPropagation();nav('/admin/events/'+e.id+'/rooms')}}>Rooms</button>
              <button className="md3-btn-outlined" style={{height:32,padding:'0 12px',fontSize:12}} onClick={(ev)=>{ev.stopPropagation();nav('/admin/events/'+e.id+'/participants')}}>Participants</button>
            </div>
          </div>
        ))}
      </div>
      )}
      <Modal opened={opened} onClose={()=>{close();setEditEvent(null);}} title={editEvent?'Edit Event':'New Event'} fullScreen>
        <div className="flex flex-col gap-12">
          {!editEvent&&(<>
            <p className="md3-label-medium">Select Hotels</p>
            {hotels.map((h:any)=><Checkbox key={h.id} label={`${h.name} — ${h.address}`} checked={selectedHotels.includes(h.id)} onChange={()=>setSelectedHotels(p=>p.includes(h.id)?p.filter(id=>id!==h.id):[...p,h.id])} />)}
            <Divider label="Or create a new hotel" labelPosition="center" />
            <Checkbox label="Add a new hotel" checked={createNewHotel} onChange={e=>setCreateNewHotel(e.currentTarget.checked)} />
            {createNewHotel&&(<><TextInput label="Hotel Name" value={form.hotel_name} onChange={e=>setForm({...form,hotel_name:e.target.value})} /><TextInput label="Address" value={form.hotel_address} onChange={e=>setForm({...form,hotel_address:e.target.value})} /></>)}
            <Divider />
          </>)}
          <TextInput label="Event Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <TextInput label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
          <div style={{display:'flex',gap:12}}><TextInput label="Start" type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} style={{flex:1}}/><TextInput label="End" type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} style={{flex:1}}/></div>
          <TextInput label="Event Code" value={form.event_code} onChange={e=>setForm({...form,event_code:e.target.value})} disabled={!!editEvent} />
          <button className="md3-btn" style={{width:'100%'}} onClick={async()=>{
            try{
              if(editEvent){await api.events.update(editEvent.id,{name:form.name,description:form.description,start_date:form.start_date,end_date:form.end_date});}
              else{
                let hotelIds=[...selectedHotels];
                if(createNewHotel&&form.hotel_name){const h=await fetch('/api/hotels',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:form.hotel_name,address:form.hotel_address,contact_person:form.contact_person,contact_phone:form.contact_phone})});hotelIds.push((await h.json()).id);}
                if(!hotelIds.length){notifications.show({title:'Error',message:'Select at least one hotel',color:'red'});return;}
                await api.events.create({hotel_ids:hotelIds,name:form.name,description:form.description,start_date:form.start_date,end_date:form.end_date,event_code:form.event_code});
              }
              notifications.show({title:editEvent?'Updated':'Created',color:'green'});close();setEditEvent(null);setForm({name:'',description:'',start_date:'',end_date:'',event_code:'',hotel_name:'',hotel_address:'',contact_person:'',contact_phone:''});setSelectedHotels([]);setCreateNewHotel(false);load();
            }catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}
          }}>{editEvent?'Update':'Create'}</button>
        </div>
      </Modal>
    </div>
  );
}
