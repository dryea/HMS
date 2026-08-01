import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconBed, IconChevronDown, IconChevronRight, IconUsers, IconChartBar, IconEdit } from '@tabler/icons-react';
import { api } from '../api/client';
import { Skeleton, Modal, TextInput, NumberInput, Select } from '@mantine/core';

export default function Rooms() {
  const { id: eventId } = useParams();
  const nav = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, {open,close}] = useDisclosure(false);
  const [editOpened, {open:openEdit,close:closeEdit}] = useDisclosure(false);
  const [assignModal, setAssignModal] = useState<string|null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [editRoom, setEditRoom] = useState<any>(null);
  const [gen, setGen] = useState({ hotel_id:'', floors:1, rooms_per_floor:10, room_prefix:'', beds_per_room:2, wing:'' });
  const [editForm, setEditForm] = useState({ room_number:'', floor:'', wing:'', status:'ready' });
  const [expandedHotels, setExpandedHotels] = useState<Record<string, boolean>>({});

  const load = async () => {
    if(!eventId) return; setLoading(true);
    try { setRooms(await api.rooms.list(eventId)); } catch {}
    try { setEvent(await api.events.get(eventId)); } catch {}
    try { setParticipants(await api.participants.list(eventId)); } catch {}
    try { setHotels(await fetch('/api/hotels').then(r=>r.json())); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [eventId]);

  const unassigned = participants.filter((p:any)=>!p.bed_label);
  const grouped = rooms.reduce((acc:any,r:any)=>{const k=r.hotel_id||'unknown';if(!acc[k])acc[k]={hotel_name:r.hotel_name||'Unknown',rooms:[]};acc[k].rooms.push(r);return acc;},{});

  if(loading) return <div className="page-container">{[1,2,3].map(i=><Skeleton key={i} height={120} radius={16} mb={12} />)}</div>;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-20">
        <h1 className="md3-headline-small m-0">Rooms & Beds</h1>
        <div className="flex gap-8">
          <button className="md3-btn-text" onClick={()=>nav('../participants')}><IconUsers size={18} /> People</button>
          <button className="md3-btn-text" onClick={()=>nav('../dashboard')}><IconChartBar size={18} /> Dash</button>
          <button className="md3-btn" onClick={open}><IconPlus size={18} /> Generate</button>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="md3-card p-24" style={{textAlign:'center'}}>
          <IconBed size={48} style={{opacity:0.3,marginBottom:16}} />
          <p className="md3-body-medium m-0 mb-8">No rooms yet</p>
          <button className="md3-btn" onClick={open}>Generate Rooms</button>
        </div>
      ) : Object.entries(grouped).map(([hotelId, g]:[string,any]) => (
        <div key={hotelId} className="md3-card p-16 mb-16">
          <div className="flex items-center gap-12 mb-12" style={{cursor:'pointer'}} onClick={()=>setExpandedHotels(prev=>({...prev,[hotelId]:!prev[hotelId]}))}>
            {expandedHotels[hotelId]?<IconChevronDown size={18}/>:<IconChevronRight size={18}/>}
            <span className="md3-title-medium m-0">{g.hotel_name}</span>
            <span className="md3-badge">{g.rooms.length} rooms</span>
            <button className="md3-btn-outlined" style={{height:32,padding:'0 12px',marginLeft:'auto'}} onClick={(e)=>{e.stopPropagation();nav('/admin/events/'+eventId+'/hotels/'+hotelId+'/rooms')}}>Manage</button>
          </div>
          {expandedHotels[hotelId] && <div className="flex flex-col gap-12">
            {g.rooms.map((room:any) => (
              <div key={room.id} className="md3-card p-12" style={{background:'var(--md-surface)'}}>
                <div className="flex items-center gap-8 mb-8">
                  <IconBed size={16} style={{color:'var(--md-on-surface-variant)'}} />
                  <span className="md3-title-small m-0">Room {room.room_number}</span>
                  {room.floor&&<span className="md3-badge" style={{background:'var(--md-surface-container-high)',color:'var(--md-on-surface)'}}>Floor {room.floor}</span>}
                  {room.wing&&<span className="md3-chip" style={{height:24,fontSize:11,padding:'0 8px'}}>{room.wing}</span>}
                  <span className="md3-chip" data-selected={room.status==='ready'} style={{height:24,fontSize:11,padding:'0 8px',marginLeft:'auto'}}>{room.status}</span>
                  <button className="md3-btn-text" style={{height:28,minWidth:28,padding:0}} onClick={(e)=>{e.stopPropagation();setEditRoom(room);setEditForm({room_number:room.room_number,floor:room.floor||'',wing:room.wing||'',status:room.status});openEdit();}}><IconEdit size={14}/></button>
                </div>
                <div className="bed-grid">
                  {(room.beds||[]).map((bed:any)=>(
                    <div key={bed.id} className={'bed-card'+(bed.is_occupied?' occupied':' vacant')} onClick={()=>{if(!bed.is_occupied)setAssignModal(bed.id);else if(bed.pid)api.participants.unassignBed(bed.pid).then(load);}}>
                      <div className="md3-label-medium">{bed.label}</div>
                      <div className="md3-body-small">{bed.bed_type}</div>
                      {bed.participant_name ? <div className="md3-body-small" style={{color:'var(--md-primary)',marginTop:4}}>{bed.participant_name}</div> : <div className="md3-body-small" style={{color:'var(--md-tertiary)',marginTop:4}}>Available</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>}
        </div>
      ))}

      <Modal opened={editOpened} onClose={closeEdit} title="Edit Room" centered>
        <div className="flex flex-col gap-12">
          <TextInput label="Room Number" value={editForm.room_number} onChange={e=>setEditForm({...editForm,room_number:e.target.value})} />
          <TextInput label="Floor" value={editForm.floor} onChange={e=>setEditForm({...editForm,floor:e.target.value})} />
          <TextInput label="Wing" value={editForm.wing} onChange={e=>setEditForm({...editForm,wing:e.target.value})} />
          <Select label="Status" data={[{value:'ready',label:'Ready'},{value:'occupied',label:'Occupied'},{value:'maintenance',label:'Maintenance'}]} value={editForm.status} onChange={v=>setEditForm({...editForm,status:v||'ready'})} />
          <button className="md3-btn" style={{width:'100%'}} onClick={async()=>{try{await fetch('/api/rooms/'+editRoom.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(editForm)});notifications.show({title:'Room updated',color:'green'});closeEdit();load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>Save</button>
        </div>
      </Modal>

      <Modal opened={opened} onClose={close} title="Generate Rooms" centered>
        <div className="flex flex-col gap-12">
          <Select label="Hotel" data={hotels.map((h:any)=>({value:h.id,label:h.name}))} value={gen.hotel_id} onChange={v=>setGen({...gen,hotel_id:v||''})} searchable />
          <TextInput label="Wing" value={gen.wing} onChange={e=>setGen({...gen,wing:e.target.value})} />
          <NumberInput label="Floors" value={gen.floors} onChange={v=>setGen({...gen,floors:Number(v)})} min={1} />
          <NumberInput label="Rooms/Floor" value={gen.rooms_per_floor} onChange={v=>setGen({...gen,rooms_per_floor:Number(v)})} min={1} />
          <NumberInput label="Beds/Room" value={gen.beds_per_room} onChange={v=>setGen({...gen,beds_per_room:Number(v)})} min={1} />
          <TextInput label="Prefix" value={gen.room_prefix} onChange={e=>setGen({...gen,room_prefix:e.target.value})} />
          <button className="md3-btn" style={{width:'100%'}} onClick={async()=>{if(!gen.hotel_id){notifications.show({title:'Error',message:'Select a hotel',color:'red'});return;}try{await api.rooms.generate({event_id:eventId,hotel_id:gen.hotel_id,...gen});notifications.show({title:'Rooms created',color:'green'});close();load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>Generate</button>
        </div>
      </Modal>

      <Modal opened={!!assignModal} onClose={()=>setAssignModal(null)} title="Assign Bed" centered>
        <div className="flex flex-col gap-8">
          {unassigned.filter((p:any)=>!p.bed_label).map((p:any)=>(
            <button key={p.id} className="md3-btn-text" style={{width:'100%',justifyContent:'flex-start'}} onClick={async()=>{try{await api.participants.assignBed(p.id,assignModal!);notifications.show({title:'Assigned',color:'green'});setAssignModal(null);load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>{p.name}</button>
          ))}
          {unassigned.filter((p:any)=>!p.bed_label).length===0 && <p className="md3-body-medium" style={{color:'var(--md-on-surface-variant)'}}>No unassigned participants</p>}
        </div>
      </Modal>
    </div>
  );
}
