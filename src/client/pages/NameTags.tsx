import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IconDownload, IconPrinter } from '@tabler/icons-react';
import { api } from '../api/client';

export default function NameTags() {
  const { id: eventId } = useParams();
  const [participants, setParticipants] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  const load = async () => {
    if (!eventId) return;
    try { setParticipants(await api.participants.list(eventId)); } catch {}
    try { setHotels(await (await fetch('/api/events/'+eventId)).json()); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const filtered = filter ? participants.filter((p:any)=>p.hotel_id===filter || p.hotel_name===filter) : participants;

  const printTags = () => {
    const w = window.open('', '_blank', 'width=800,height=600');
    if (!w) return;
    const tags = filtered.map(p => `
      <div class="tag">
        <div class="tag-name">${p.name}</div>
        <div class="tag-company">${p.company||p.hotel_name||''}</div>
        <div class="tag-room">${p.room_number ? 'Room '+p.room_number : ''}</div>
      </div>
    `).join('');
    w.document.write(`<html><head><title>Name Tags</title><style>
      @page { size: A4; margin: 10mm; }
      body { font-family: sans-serif; }
      .tag { width: 80mm; height: 50mm; border: 2px solid #1C1B1B; border-radius: 12px; display: inline-block; vertical-align: top; margin: 4mm; padding: 8mm; box-sizing: border-box; text-align: center; page-break-inside: avoid; }
      .tag-name { font-size: 20px; font-weight: 700; color: #1C1B1B; margin-bottom: 4px; text-transform: capitalize; }
      .tag-company { font-size: 12px; color: #555; margin-bottom: 4px; }
      .tag-room { font-size: 11px; color: #8C4A48; font-weight: 500; }
    </style></head><body>${tags}</body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-16" style={{flexWrap:'wrap',gap:8}}>
        <h1 className="md3-headline-small m-0">Name Tags ({filtered.length})</h1>
        <div className="flex gap-8">
          <select className="md3-text-field" style={{minHeight:36,padding:'4px 8px',fontSize:14,maxWidth:200}} value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="">All Hotels</option>
            {hotels?.hotels?.map((h:any)=><option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          <button className="md3-btn" onClick={printTags}><IconPrinter size={18}/> Print Tags</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:8}}>
        {filtered.map(p=>(
          <div key={p.id} className="md3-card p-12" style={{textAlign:'center',minHeight:80,display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <div className="md3-title-small" style={{textTransform:'capitalize'}}>{p.name}</div>
            <div className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>{p.company||''}</div>
            {p.room_number&&<div className="md3-body-small" style={{color:'var(--md-primary)'}}>Room {p.room_number}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
