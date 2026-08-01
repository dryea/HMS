import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconDownload, IconQrcode, IconRefresh, IconBuilding, IconBed, IconUsers } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { api } from '../api/client';
import { Skeleton } from '@mantine/core';

export default function Dashboard() {
  const { id: eventId } = useParams();
  const nav = useNavigate();
  const [dash, setDash] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [qrDone, setQrDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if(!eventId) return; setLoading(true);
    try { setDash(await api.reporting.dashboard(eventId)); } catch {}
    try { setEvent(await api.events.get(eventId)); } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [eventId]);

  if(loading) return <div className="page-container">{[1,2,3,4].map(i=><Skeleton key={i} height={80} radius={16} mb={12} />)}</div>;
  if(!dash) return null;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-20" style={{flexWrap:'wrap',gap:8}}>
        <h1 className="md3-headline-small m-0">Dashboard</h1>
        <div className="flex gap-8" style={{flexWrap:'wrap'}}>
          <button className="md3-btn-text" onClick={()=>nav('../rooms')}><IconBed size={18}/> Rooms</button>
          <button className="md3-btn-text" onClick={()=>nav('../participants')}><IconUsers size={18}/> People</button>
          <button className="md3-btn-text" onClick={load}><IconRefresh size={18}/> Refresh</button>
          <a className="md3-btn-outlined" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8}} href={'/api/reporting/export/'+eventId} target="_blank"><IconDownload size={18}/> CSV</a>
          <a className="md3-btn-outlined" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8}} href={'/api/reporting/pdf/'+eventId} target="_blank"><IconDownload size={18}/> PDF</a>
        </div>
      </div>

      <div className="stat-grid">
        <div className="md3-card stat-card p-20">
          <div className="stat-value">{dash.total}</div>
          <div className="stat-label">Participants</div>
        </div>
        <div className="md3-card stat-card p-20">
          <div className="stat-value">{dash.rooms}</div>
          <div className="stat-label">Rooms</div>
        </div>
        <div className="md3-card stat-card p-20">
          <div className="stat-value">{dash.beds_total}</div>
          <div className="stat-label">Total Beds</div>
        </div>
        <div className="md3-card stat-card p-20">
          <div className="stat-value">{dash.beds_occupied}</div>
          <div className="stat-label">Occupied</div>
        </div>
      </div>

      <div className="md3-card p-20 mb-16">
        <div className="flex items-center gap-16">
          <div style={{width:80,height:80,borderRadius:'50%',background:'conic-gradient(var(--md-primary) '+(dash.beds_total?Math.round((dash.beds_occupied/dash.beds_total)*100):0)+'%, var(--md-surface-container-high) 0)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span className="md3-title-medium" style={{background:'var(--md-surface-container-low)',width:60,height:60,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>{dash.beds_total?Math.round((dash.beds_occupied/dash.beds_total)*100):0}%</span>
          </div>
          <div>
            <span className="md3-title-medium">Occupancy</span>
            <div className="flex gap-4 mt-4">
              {(dash.by_status||[]).map((s:any) => <span key={s.status} className="md3-badge" style={{background:'var(--md-surface-container-high)',color:'var(--md-on-surface)'}}>{s.status}: {s.count}</span>)}
            </div>
          </div>
        </div>
      </div>

      {(dash.hotels||[]).length > 0 && (
        <div className="md3-card p-20 mb-16">
          <h3 className="md3-title-medium m-0 mb-12">Per Hotel Breakdown</h3>
          <div style={{overflowX:'auto'}}>
          <table>
            <thead><tr><th>Hotel</th><th>Rooms</th><th>Beds</th><th>Occupied</th><th>Parts</th></tr></thead>
            <tbody>
              {(dash.hotels||[]).map((h:any) => (
                <tr key={h.id} style={{cursor:'pointer'}} onClick={()=>nav('../hotels/'+h.id+'/rooms')}>
                  <td><div className="flex items-center gap-4"><IconBuilding size={14}/><span className="md3-body-medium">{h.name}</span></div></td>
                  <td>{h.rooms||0}</td><td>{h.beds||0}</td><td>{h.occupied||0}</td><td>{h.participants||0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <div className="md3-card p-20">
        <h3 className="md3-title-medium m-0 mb-12">QR Codes</h3>
        <button className="md3-btn" onClick={async()=>{try{const r=await api.qr.generate(eventId!);setQrDone(true);notifications.show({title:'QR Generated',message:'Successfully generated '+r.count+' codes',color:'green'});}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}} style={{background:qrDone?'var(--md-tertiary)':'var(--md-primary)'}}>{qrDone?'QR Generated':'Generate All QR Codes'}</button>
      </div>
    </div>
  );
}
