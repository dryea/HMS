import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconPhone, IconBrandWhatsapp, IconQrcode, IconBed } from '@tabler/icons-react';
import { api } from '../api/client';
import { Modal, TextInput } from '@mantine/core';

export default function HotelParticipants() {
  const { id: eventId, hid: hotelId } = useParams();
  const nav = useNavigate();
  const [participants, setParticipants] = useState<any[]>([]);
  const [hotel, setHotel] = useState<any>(null);
  const [allHotels, setAllHotels] = useState<any[]>([]);
  const [opened, {open,close}] = useDisclosure(false);
  const [form, setForm] = useState({ein:'',name:'',phone:'',email:'',company:'',department:''});

  const load = async () => {
    if(!eventId||!hotelId) return;
    try { setParticipants(await api.participants.listByHotel(eventId, hotelId)); } catch {}
    try { setHotel(await (await fetch('/api/hotels/'+hotelId)).json()); } catch {}
    try { setAllHotels(await fetch('/api/hotels').then(r=>r.json())); } catch {}
  };
  useEffect(() => { load(); }, [eventId, hotelId]);

  return (
    <div className="page-container">
      <div className="flex items-center gap-12 mb-20">
        <span className="md3-title-large m-0">{hotel?.name||'Hotel'} Participants ({participants.length})</span>
        <select className="md3-text-field" style={{minHeight:36,padding:'4px 8px',fontSize:14,maxWidth:200}} value={hotelId} onChange={v=>v.target.value!==hotelId&&nav('/admin/events/'+eventId+'/hotels/'+v.target.value+'/participants')}>
          {allHotels.map((h:any)=><option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </div>
      <div className="flex gap-8 mb-16">
        <button className="md3-btn-text" onClick={()=>nav('/admin/events/'+eventId+'/hotels/'+hotelId+'/rooms')}><IconBed size={18}/> Rooms</button>
        <button className="md3-btn" onClick={open}><IconPlus size={18}/> Add</button>
      </div>
      <div style={{overflowX:'auto'}}>
      <table>
        <thead><tr><th>Name</th><th>Phone</th><th>Room</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {participants.map((p:any)=>(
            <tr key={p.id}>
              <td><div className="md3-body-medium" style={{fontWeight:500}}>{p.name}</div><div className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>{p.company||p.department||''}</div></td>
              <td><span className="md3-body-medium">{p.phone||'-'}</span></td>
              <td><span className="md3-body-medium">{p.room_number?p.room_number+'/'+p.bed_label:'-'}</span></td>
              <td><span className="md3-badge" style={{background:p.status==='checked_in'?'var(--md-tertiary)':p.status==='arrived'?'var(--md-primary-container)':'var(--md-surface-container-high)',color:p.status==='checked_in'?'var(--md-on-tertiary)':p.status==='arrived'?'var(--md-on-primary-container)':'var(--md-on-surface)'}}>{p.status}</span></td>
              <td><div className="flex gap-4">
                {p.phone&&<><a className="md3-btn-text" style={{height:28,minWidth:28,padding:0,textDecoration:'none'}} href={'https://wa.me/'+p.phone.replace(/[^0-9]/g,'')} target="_blank"><IconBrandWhatsapp size={14}/></a><a className="md3-btn-text" style={{height:28,minWidth:28,padding:0,textDecoration:'none'}} href={'sms:'+p.phone}><IconPhone size={14}/></a></>}
                {p.qr_token&&<a className="md3-btn-text" style={{height:28,minWidth:28,padding:0,textDecoration:'none'}} href={'/qr/'+p.qr_token} target="_blank"><IconQrcode size={14}/></a>}
                <button className="md3-btn-text" style={{height:28,minWidth:28,padding:0,color:'var(--md-error)'}} onClick={async()=>{if(confirm('Delete?')){await api.participants.delete(p.id);load();}}}><IconTrash size={14}/></button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <Modal opened={opened} onClose={close} title="Add Participant" centered>
        <div className="flex flex-col gap-12">
          <TextInput label="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <TextInput label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <button className="md3-btn" style={{width:'100%'}} onClick={async()=>{try{await api.participants.create({event_id:eventId,hotel_id:hotelId,...form});notifications.show({title:'Added',color:'green'});close();load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>Add</button>
        </div>
      </Modal>
    </div>
  );
}
