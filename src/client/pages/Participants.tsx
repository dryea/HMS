import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconUpload, IconTrash, IconPhone, IconBrandWhatsapp, IconQrcode, IconBed, IconChartBar, IconUsers, IconDownload, IconFileDownload } from '@tabler/icons-react';
import { api } from '../api/client';
import { Modal, TextInput, Select } from '@mantine/core';
import * as XLSX from 'xlsx';

export default function Participants() {
  const { id: eventId } = useParams();
  const [participants, setParticipants] = useState<any[]>([]);
  const [children, setChildren] = useState<Record<string, any[]>>({});
  const [event, setEvent] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [hotelFilter, setHotelFilter] = useState<string>('');
  const [opened, { open, close }] = useDisclosure(false);
  const [bulkOpened, { open: openBulk, close: closeBulk }] = useDisclosure(false);
  const [childOpened, { open: openChild, close: closeChild }] = useDisclosure(false);
  const [childForm, setChildForm] = useState({ participant_id: '', name: '', age: '' });
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ ein: '', name: '', phone: '', email: '', company: '', department: '', hotel_id: '' });
  const [bulkText, setBulkText] = useState('');

  const load = async () => {
    if (!eventId) return;
    try {
      const parts = await api.participants.list(eventId); setParticipants(parts);
      const childMap: Record<string, any[]> = {};
      for (const p of parts) { try { childMap[p.id] = await (await fetch('/api/participants/' + p.id + '/children')).json(); } catch { childMap[p.id] = []; } }
      setChildren(childMap);
    } catch {}
    try { setEvent(await api.events.get(eventId)); } catch {}
    try { setHotels(await fetch('/api/hotels').then(r=>r.json())); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const filtered = hotelFilter ? participants.filter((p: any) => p.hotel_id === hotelFilter) : participants;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-16" style={{flexWrap:'wrap',gap:8}}>
        <h1 className="md3-headline-small m-0">Participants ({filtered.length})</h1>
        <div className="flex gap-8">
          <button className="md3-btn-text" onClick={()=>window.location.href='/admin/events/'+eventId+'/rooms'}><IconBed size={18}/> Rooms</button>
          <button className="md3-btn-text" onClick={()=>window.location.href='/admin/events/'+eventId+'/dashboard'}><IconChartBar size={18}/> Dash</button>
          <a className="md3-btn-text" style={{textDecoration:'none'}} href={'/api/qr/download-all/'+eventId}><IconDownload size={18}/> QR Zip</a>
          <button className="md3-btn-text" onClick={openBulk}><IconUpload size={18}/> CSV</button>
          <button className="md3-btn" onClick={open}><IconPlus size={18}/> Add</button>
        </div>
      </div>

      <select className="md3-text-field mb-16" value={hotelFilter} onChange={e=>setHotelFilter(e.target.value)} style={{minHeight:40,padding:'8px 12px'}}>
        <option value="">All Hotels</option>
        {hotels.map((h:any)=><option key={h.id} value={h.id}>{h.name}</option>)}
      </select>

      <div style={{overflowX:'auto'}}>
      <table>
        <thead><tr><th>Name</th><th>Hotel</th><th>Phone</th><th>Room</th><th>Status</th><th style={{width:180}}>Actions</th></tr></thead>
        <tbody>
          {filtered.map((p:any) => (
            <>
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-4">
                    <span className="md3-body-medium" style={{fontWeight:500}}>{p.name}</span>
                    {(children[p.id]?.length||0)>0&&<button className="md3-chip" style={{height:20,fontSize:10,padding:'0 6px',background:'var(--md-secondary-container)',borderColor:'transparent'}} onClick={()=>setExpandedRows(prev=>({...prev,[p.id]:!prev[p.id]}))}>+{children[p.id].length}</button>}
                  </div>
                  <div className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>{p.company||p.department||''}</div>
                </td>
                <td><span className="md3-body-small">{p.hotel_name||'-'}</span></td>
                <td><span className="md3-body-medium">{p.phone||'-'}</span></td>
                <td><span className="md3-body-medium">{p.room_number?p.room_number+'/'+p.bed_label:'-'}</span></td>
                <td><span className="md3-badge" style={{background: p.status==='checked_in'?'var(--md-tertiary)':p.status==='arrived'?'var(--md-primary-container)':'var(--md-surface-container-high)',color: p.status==='checked_in'?'var(--md-on-tertiary)':p.status==='arrived'?'var(--md-on-primary-container)':'var(--md-on-surface)'}}>{p.status}</span></td>
                <td>
                  <div className="flex gap-4">
                    <button className="md3-btn-text" style={{height:28,minWidth:28,padding:0}} onClick={()=>{setChildForm({participant_id:p.id,name:'',age:''});openChild();}} title="Add child"><IconUsers size={14}/></button>
                    {p.phone&&<><a className="md3-btn-text" style={{height:28,minWidth:28,padding:0,textDecoration:'none'}} href={'https://wa.me/'+p.phone.replace(/[^0-9]/g,'')} target="_blank"><IconBrandWhatsapp size={14}/></a>
                    <a className="md3-btn-text" style={{height:28,minWidth:28,padding:0,textDecoration:'none'}} href={'sms:'+p.phone}><IconPhone size={14}/></a></>}
                    {p.qr_token&&<a className="md3-btn-text" style={{height:28,minWidth:28,padding:0,textDecoration:'none'}} href={'/qr/'+p.qr_token} target="_blank"><IconQrcode size={14}/></a>}
                    <button className="md3-btn-text" style={{height:28,minWidth:28,padding:0,color:'var(--md-error)'}} onClick={async()=>{if(confirm('Delete?')){await api.participants.delete(p.id);load();}}}><IconTrash size={14}/></button>
                  </div>
                </td>
              </tr>
              {expandedRows[p.id]&&(children[p.id]||[]).map((c:any)=>(
                <tr key={c.id}><td colSpan={6}><div className="flex items-center gap-8" style={{padding:'4px 0 4px 32px'}}><span className="md3-body-medium">👶 {c.name}</span><span className="md3-badge" style={{background:'var(--md-secondary-container)',color:'var(--md-on-secondary-container)'}}>{c.age}y</span><span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>(child of {p.name})</span><button className="md3-btn-text" style={{height:24,minWidth:24,padding:0,color:'var(--md-error)',fontSize:12}} onClick={async()=>{await fetch('/api/participants/children/'+c.id,{method:'DELETE'});load();}}>Remove</button></div></td></tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
      </div>

      <Modal opened={opened} onClose={close} title="Add Participant" centered>
        <div className="flex flex-col gap-12">
          <Select label="Hotel" data={hotels.map(h=>({value:h.id,label:h.name}))} value={form.hotel_id} onChange={v=>setForm({...form,hotel_id:v||''})} searchable />
          <TextInput label="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          <TextInput label="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <TextInput label="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          <TextInput label="Company" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} />
          <button className="md3-btn" style={{width:'100%'}} onClick={async()=>{try{await api.participants.create({event_id:eventId,...form});notifications.show({title:'Added',color:'green'});close();load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>Add</button>
        </div>
      </Modal>

      <Modal opened={childOpened} onClose={closeChild} title="Add Child" centered>
        <div className="flex flex-col gap-12">
          <TextInput label="Child Name" value={childForm.name} onChange={e=>setChildForm({...childForm,name:e.target.value})} />
          <TextInput label="Age" type="number" value={childForm.age} onChange={e=>setChildForm({...childForm,age:e.target.value})} />
          <button className="md3-btn" style={{width:'100%'}} onClick={async()=>{try{await fetch('/api/participants/'+childForm.participant_id+'/children',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:childForm.name,age:parseInt(childForm.age)||0})});notifications.show({title:'Child added',color:'green'});closeChild();load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>Add</button>
        </div>
      </Modal>

      <Modal opened={bulkOpened} onClose={closeBulk} title="Bulk Import" fullScreen>
        <div className="flex flex-col gap-12">
          <Select label="Hotel" data={hotels.map(h=>({value:h.id,label:h.name}))} value={form.hotel_id} onChange={v=>setForm({...form,hotel_id:v||''})} searchable />
          <div className="flex gap-8 items-center">
            <p className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>Upload Excel (.xlsx) or CSV file:</p>
            <a className="md3-btn-text" href="/api/reporting/csv-template" download><IconFileDownload size={16}/> Template</a>
          </div>
          <input type="file" accept=".xlsx,.xls,.csv" className="md3-text-field" style={{minHeight:44,padding:'8px 12px'}}
            onChange={async(e)=>{
              const file = e.target.files?.[0];
              if(!file) return;
              try{
                const data = await file.arrayBuffer();
                const wb = XLSX.read(data);
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(ws, {header:1});
                const lines = rows.slice(1).filter((r:any)=>r && r[1]).map((r:any)=>({ein:String(r[0]||'').trim(),name:String(r[1]||'').trim(),phone:String(r[2]||'').trim(),email:String(r[3]||'').trim(),company:String(r[4]||'').trim(),department:String(r[5]||'').trim(),children:String(r[6]||'')}));
                if(!lines.length){notifications.show({title:'No data found',message:'Ensure first row is headers: ein,name,phone,email,company,department,children',color:'red'});return;}
                const result = await api.participants.bulk({event_id:eventId,hotel_id:form.hotel_id||null,participants:lines});
                if(result?.participants){for(let i=0;i<result.participants.length;i++){const ch=lines[i]?.children;if(ch){ch.split(';').filter(Boolean).forEach((c:string)=>{const m=c.match(/(.+?)\((\d+)\)/);if(m)fetch('/api/participants/'+result.participants[i].id+'/children',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:m[1].trim(),age:parseInt(m[2])})});});}}}
                notifications.show({title:'Imported '+lines.length+' participants',color:'green'});closeBulk();load();
              }catch(err){notifications.show({title:'Error',message:'Could not parse file',color:'red'});}
            }} />
          <div className="flex items-center gap-8"><div style={{flex:1,height:1,background:'var(--md-outline-variant)'}}/><span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>or paste CSV</span><div style={{flex:1,height:1,background:'var(--md-outline-variant)'}}/></div>
          <p className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>CSV: ein, name, phone, email, company, dept, children (name(age);...)</p>
          <textarea className="md3-text-field" rows={8} placeholder="1992, John Doe, +977, j@c.com, Acme, Sales, Aarav(3);Neha(5)" value={bulkText} onChange={e=>setBulkText(e.target.value)} style={{minHeight:160}} />
          <button className="md3-btn" style={{width:'100%'}} onClick={async()=>{
            const lines = bulkText.trim().split('\n').map(l=>{const p=l.split(',').map(s=>s.trim());const ch=p[6]||'';return{ein:p[0]||'',name:p[1]||'',phone:p[2]||'',email:p[3]||'',company:p[4]||'',department:p[5]||'',children:ch};}).filter(p=>p.name);
            if(!lines.length){notifications.show({title:'Nothing to import',color:'red'});return;}
            try{
              const r = await api.participants.bulk({event_id:eventId,hotel_id:form.hotel_id||null,participants:lines});
              if(r?.participants){for(let i=0;i<r.participants.length;i++){const ch=lines[i]?.children;if(ch){ch.split(';').filter(Boolean).forEach((c:string)=>{const m=c.match(/(.+?)\((\d+)\)/);if(m)fetch('/api/participants/'+r.participants[i].id+'/children',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:m[1].trim(),age:parseInt(m[2])})});});}}}
              notifications.show({title:'Imported',color:'green'});closeBulk();load();
            }catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}
          }}>Import</button>
        </div>
      </Modal>
    </div>
  );
}
