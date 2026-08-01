import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconBed, IconEdit, IconChevronDown, IconChevronRight, IconTrash, IconUsers } from '@tabler/icons-react';
import { api } from '../api/client';
import { Modal, TextInput, NumberInput, Select } from '@mantine/core';

export default function HotelRooms() {
  const { id: eventId, hid: hotelId } = useParams();
  const nav = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [hotel, setHotel] = useState<any>(null);
  const [allHotels, setAllHotels] = useState<any[]>([]);
  const [opened, {open,close}] = useDisclosure(false);
  const [editOpened, {open:openEdit,close:closeEdit}] = useDisclosure(false);
  const [assignModal, setAssignModal] = useState<string|null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [editRoom, setEditRoom] = useState<any>(null);
  const [gen, setGen] = useState({ floors:1, rooms_per_floor:10, room_prefix:'', beds_per_room:2, wing:'' });
  const [editForm, setEditForm] = useState({ room_number:'', floor:'', wing:'', status:'ready' });
  const [expandedWings, setExpandedWings] = useState<Record<string, boolean>>({});

  const load = async () => {
    if(!eventId||!hotelId) return;
    try { setRooms(await api.rooms.listByHotel(eventId, hotelId)); } catch {}
    try { setHotel(await (await fetch('/api/hotels/'+hotelId)).json()); } catch {}
    try { setParticipants(await api.participants.listByHotel(eventId, hotelId)); } catch {}
    try { setAllHotels(await fetch('/api/hotels').then(r=>r.json())); } catch {}
  };
  useEffect(() => { load(); }, [eventId, hotelId]);

  const unassigned = participants.filter((p:any)=>!p.bed_label);
  const byWing = rooms.reduce((acc:any,r:any)=>{const w=r.wing||'General';if(!acc[w])acc[w]=[];acc[w].push(r);return acc;},{});

  return (
    <div className="page-container">
      <div className="flex items-center gap-12 mb-20">
        <span className="md3-title-large m-0">{hotel?.name||'Hotel'} Rooms</span>
        <select className="md3-text-field" style={{minHeight:36,padding:'4px 8px',fontSize:14,maxWidth:200}} value={hotelId} onChange={v=>v.target.value!==hotelId&&nav('/admin/events/'+eventId+'/hotels/'+v.target.value+'/rooms')}>
          {allHotels.map((h:any)=><option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>
      <div className="flex gap-8 mb-16">
        <button className="md3-btn-text" onClick={()=>nav('/admin/events/'+eventId+'/hotels/'+hotelId+'/participants')}><IconUsers size={18}/> People</button>
        <button className="md3-btn" onClick={open}><IconPlus size={18}/> Generate</button>
      </div>

      {Object.entries(byWing).map(([wing, wingRooms]:[string,any]) => (
        <div key={wing} className="md3-card p-16 mb-12">
          <div className="flex items-center gap-8 mb-8" style={{cursor:'pointer'}} onClick={()=>setExpandedWings(prev=>({...prev,[wing]:!prev[wing]}))}>
            {expandedWings[wing]?<IconChevronDown size={18}/>:<IconChevronRight size={18}/>}
            <span className="md3-title-medium m-0">{wing}</span>
            <span className="md3-badge">{wingRooms.length} rooms</span>
          </div>
          {expandedWings[wing] && wingRooms.map((room:any)=>(
            <div key={room.id} className="md3-card p-12 mb-8" style={{background:'var(--md-surface)'}}>
              <div className="flex items-center gap-8 mb-8">
                <IconBed size={16}/><span className="md3-title-small">Room {room.room_number}</span>
                {room.floor&&<span className="md3-badge" style={{background:'var(--md-surface-container-high)',color:'var(--md-on-surface)'}}>Floor {room.floor}</span>}
                <span className="md3-chip" data-selected={room.status==='ready'} style={{height:24,fontSize:11,padding:'0 8px'}}>{room.status}</span>
                <button className="md3-btn-text" style={{height:28,minWidth:28,padding:0}} onClick={()=>{setEditRoom(room);setEditForm({room_number:room.room_number,floor:room.floor||'',wing:room.wing||'',status:room.status});openEdit();}}><IconEdit size={14}/></button>
                <button className="md3-btn-text" style={{height:28,minWidth:28,padding:0,color:'var(--md-error)',marginLeft:'auto'}} onClick={async()=>{if(confirm('Delete?')){await api.rooms.delete(room.id);load();}}}><IconTrash size={14}/></button>
              </div>
              <div className="bed-grid">
                {(room.beds||[]).map((bed:any)=>(
                  <div key={bed.id} className={'bed-card'+(bed.is_occupied?' occupied':' vacant')} onClick={()=>{if(!bed.is_occupied)setAssignModal(bed.id);else if(bed.pid)api.participants.unassignBed(bed.pid).then(load);}}>
                    <div className="md3-label-medium">{bed.label}</div>
                    <div className="md3-body-small" style={{color:bed.is_occupied?'var(--md-error)':'var(--md-tertiary)'}}>{bed.participant_name||'Available'}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      <Modal opened={editOpened} onClose={closeEdit} title="Edit Room" centered>
        <div className="flex flex-col gap-12">
          <TextInput label="Room Number" value={editForm.room_number} onChange={e=>setEditForm({...editForm,room_number:e.target.value})} />
          <TextInput label="Floor" value={editForm.floor} onChange={e=>setEditForm({...editForm,floor:e.target.value})} />
          <TextInput label="Wing" value={editForm.wing} onChange={e=>setEditForm({...editForm,wing:e.target.value})} />
          <Select label="Status" data={[{value:'ready',label:'Ready'},{value:'occupied',label:'Occupied'},{value:'maintenance',label:'Maintenance'}]} value={editForm.status} onChange={v=>setEditForm({...editForm,status:v||'ready'})} />
          <button className="md3-btn" style={{width:'100%'}} onClick={async()=>{try{await fetch('/api/rooms/'+editRoom.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(editForm)});notifications.show({title:'Room updated',message:'The room has been updated.',color:'green'});closeEdit();load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>Save</button>
        </div>
      </Modal>

      <Modal opened={opened} onClose={close} title="Generate Rooms" centered>
        <div className="flex flex-col gap-12">
          <TextInput label="Wing" value={gen.wing} onChange={e=>setGen({...gen,wing:e.target.value})} />
          <NumberInput label="Floors" value={gen.floors} onChange={v=>setGen({...gen,floors:Number(v)})} min={1} />
          <NumberInput label="Rooms/Floor" value={gen.rooms_per_floor} onChange={v=>setGen({...gen,rooms_per_floor:Number(v)})} min={1} />
          <NumberInput label="Beds/Room" value={gen.beds_per_room} onChange={v=>setGen({...gen,beds_per_room:Number(v)})} min={1} />
          <TextInput label="Prefix" value={gen.room_prefix} onChange={e=>setGen({...gen,room_prefix:e.target.value})} />
          <button className="md3-btn" style={{width:'100%'}} onClick={async()=>{try{await api.rooms.generate({event_id:eventId,hotel_id:hotelId,...gen});notifications.show({title:'Rooms created',message:'Rooms have been generated successfully.',color:'green'});close();load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>Generate</button>
        </div>
      </Modal>

      <Modal opened={!!assignModal} onClose={()=>setAssignModal(null)} title="Assign Bed" centered>
        <div className="flex flex-col gap-8">
          {unassigned.map((p:any)=><button key={p.id} className="md3-btn-text" style={{width:'100%',justifyContent:'flex-start'}} onClick={async()=>{try{await api.participants.assignBed(p.id,assignModal!);notifications.show({title:'Assigned',message:'Participant assigned to bed.',color:'green'});setAssignModal(null);load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>{p.name}</button>)}
          {unassigned.length===0&&<p className="md3-body-medium" style={{color:'var(--md-on-surface-variant)'}}>No unassigned participants</p>}
        </div>
      </Modal>
    </div>
  );
}
