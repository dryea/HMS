import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { IconCamera, IconCheck, IconSearch, IconRefresh, IconBuilding, IconDoorExit, IconHistory, IconCoffee } from '@tabler/icons-react';
import { api } from '../api/client';

export default function StaffDashboard() {
  const nav=useNavigate();
  const session=JSON.parse(sessionStorage.getItem('staff_session')||'null');
  const [dash,setDash]=useState<any>(null);
  const [rooms,setRooms]=useState<any[]>([]);
  const [tab,setTab]=useState<string>('overview');
  const [scanMode,setScanMode]=useState(false);
  const [manualToken,setManualToken]=useState('');
  const [result,setResult]=useState<any>(null);
  const [history,setHistory]=useState<any[]>([]);
  const [serviceData,setServiceData]=useState<any[]>([]);
  const [scanner,setScanner]=useState<any>(null);
  const [preview,setPreview]=useState<any>(null);
  const scannerRef=useRef<HTMLDivElement>(null);

  const event=session?.event;const hotel=session?.hotel;

  const load=async()=>{if(!event?.id||!hotel?.id)return;try{setDash(await api.reporting.dashboardByHotel(event.id,hotel.id));}catch{}try{setRooms(await api.rooms.listByHotel(event.id,hotel.id));}catch{}try{setHistory(await api.checkin.list(event.id));}catch{}};
  useEffect(()=>{if(!session)nav('/');load();},[]);

  const startScanner=useCallback(async()=>{
    try{const{Html5Qrcode:H5Q}=await import('html5-qrcode');const s=new H5Q('qr-reader');await s.start({facingMode:'environment'},{fps:10,qrbox:{width:250,height:250}},async(decodedText:string)=>{await s.stop();setScanMode(false);const token=decodedText.split('token=')[1]?.split('&')[0]||decodedText;doCheckin(token);});setScanner(s);setScanMode(true);}
    catch{notifications.show({title:'Camera Error',message:'Use manual entry instead',color:'red'});}
  },[event,hotel]);

  const doCheckin=async(token:string)=>{try{const res=await api.checkin.scan(token,'Staff',hotel?.id);setResult(res);setHistory(prev=>[{participant:res.participant,status:res.status,time:new Date().toLocaleTimeString()},...prev].slice(0,10));if(navigator.vibrate)navigator.vibrate(30);notifications.show({title:res.participant||'Checked in',message:'Status: '+res.status,color:'green'});load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};

  if(!event||!hotel)return<div className="page-container"><p>Not logged in</p></div>;
  const recentCheckins=history.slice(0,10);

  return(<div className="page-container">
    <div className="flex items-center justify-between mb-20">
      <div className="flex items-center gap-8"><IconBuilding size={24} style={{color:'var(--md-primary)'}}/><div><h1 className="md3-title-large m-0">{hotel.name}</h1><p className="md3-body-small m-0" style={{color:'var(--md-on-surface-variant)'}}>{event.name} · {event.code}</p></div></div>
      <button className="md3-btn-text" style={{height:40,width:40,padding:0,color:'var(--md-error)'}} onClick={()=>{sessionStorage.removeItem('staff_session');nav('/');}}><IconDoorExit size={20}/></button>
    </div>

    <div className="flex gap-4 mb-16" style={{background:'var(--md-surface-container-high)',borderRadius:9999,padding:4}}>
      {['overview','scan','attendance','history'].map(t=><button key={t} className="md3-chip" data-selected={tab===t} onClick={()=>setTab(t)} style={{flex:1,justifyContent:'center'}}>{t==='overview'?'Overview':t==='scan'?'Scan':t==='attendance'?'Meals':'History'}</button>)}
    </div>

    {tab==='overview'&&<div>
      {dash&&<div className="stat-grid">
        <div className="md3-card stat-card p-16"><div className="stat-value">{dash.beds_total||0}</div><div className="stat-label">Beds</div></div>
        <div className="md3-card stat-card p-16"><div className="stat-value" style={{color:'var(--md-tertiary)'}}>{dash.beds_vacant||0}</div><div className="stat-label">Vacant</div></div>
        <div className="md3-card stat-card p-16"><div className="stat-value" style={{color:'var(--md-primary)'}}>{dash.beds_occupied||0}</div><div className="stat-label">Occupied</div></div>
        <div className="md3-card stat-card p-16"><div className="stat-value">{dash.total||0}</div><div className="stat-label">Participants</div></div>
      </div>}
      <h2 className="md3-title-medium m-0 mb-12">Room Occupancy</h2>
      {rooms.map((room:any)=>(<div key={room.id} className="md3-card p-12 mb-8">
        <div className="flex items-center gap-8 mb-4"><span className="md3-title-small">Room {room.room_number}</span>{room.wing&&<span className="md3-badge" style={{background:'var(--md-surface-container-high)',color:'var(--md-on-surface)'}}>{room.wing}</span>}</div>
        <div className="bed-grid">{(room.beds||[]).map((bed:any)=>(<div key={bed.id} className={'bed-card'+(bed.is_occupied?' occupied':' vacant')}><span className="md3-label-medium">{bed.label}</span><span className="md3-body-small" style={{color:bed.is_occupied?'var(--md-error)':'var(--md-tertiary)'}}>{bed.is_occupied?bed.participant_name||'Occupied':'Vacant'}</span></div>))}</div>
      </div>))}
      <button className="md3-btn-text" style={{width:'100%',justifyContent:'center',marginTop:8}} onClick={load}><IconRefresh size={18}/> Refresh</button>
    </div>}

    {tab==='scan'&&<div>
      {!scanMode?<div className="flex flex-col gap-12">
        <button className="md3-btn" style={{height:56,fontSize:16}} onClick={startScanner}><IconCamera size={24}/> Scan QR Code</button>
        <div className="md3-card p-16"><p className="md3-body-medium mb-8">Or enter token manually:</p>
          <div className="flex gap-8"><input className="md3-text-field" style={{flex:1,minHeight:44}} placeholder="Paste QR token" value={manualToken} onChange={e=>setManualToken(e.target.value)} /><button className="md3-btn" style={{minWidth:44,padding:8}} onClick={()=>doCheckin(manualToken)}><IconSearch size={18}/></button></div></div>
      </div>:<div className="flex flex-col gap-12"><div id="qr-reader" ref={scannerRef} style={{width:'100%',maxWidth:400}} /><button className="md3-btn-text" style={{color:'var(--md-error)'}} onClick={async()=>{if(scanner){try{await scanner.stop();}catch{}setScanner(null);}setScanMode(false);}}>Stop Camera</button></div>}
      {result&&<div className="md3-card p-20 mt-12" style={{textAlign:'center'}}><IconCheck size={48} style={{color:'var(--md-tertiary)',marginBottom:8}}/><h2 className="md3-title-large m-0">{result.participant}</h2><span className="md3-badge" style={{background:'var(--md-tertiary)',color:'var(--md-on-tertiary)',fontSize:14,padding:'4px 16px'}}>{result.status}</span></div>}
      {recentCheckins.length>0&&<div className="md3-card p-16 mt-12"><h3 className="md3-title-small m-0 mb-8">Recent Check-ins</h3>{recentCheckins.map((c:any,i:number)=>(<div key={i} className="flex items-center gap-8 mb-4"><IconCheck size={14} style={{color:'var(--md-tertiary)'}}/><span className="md3-body-small">{c.participant} → {c.status}</span></div>))}</div>}
    </div>}

    {tab==='attendance'&&<div className="md3-card p-16">
      <h3 className="md3-title-medium m-0 mb-12">Today's Meals</h3>
      <input type="date" className="md3-text-field" style={{minHeight:40,padding:'0 12px',marginBottom:12}} defaultValue={new Date().toISOString().split('T')[0]} onChange={async(e)=>{try{const dates=await(await fetch('/api/services/'+event.id+'/dates')).json();const day=dates.find((d:any)=>d.date===e.target.value);setServiceData(day?.services||[]);}catch{}}} />
      {serviceData.map((svc:any)=>(<div key={svc.id} className="md3-card p-12 mb-8" style={{background:'var(--md-surface)'}}>
        <div className="flex items-center justify-between mb-8"><span className="md3-title-small">{svc.service_name}</span><span className="md3-badge" style={{background:'var(--md-surface-container-high)',color:'var(--md-on-surface)'}}>{svc.start_time||''}-{svc.end_time||''}</span></div>
        <button className="md3-btn-text" style={{color:'var(--md-tertiary)'}} onClick={async()=>{try{await fetch('/api/services/'+event.id+'/attendance/bulk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event_date_service_id:svc.id})});notifications.show({title:'All marked present',color:'green'});}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>Mark All Present</button>
      </div>))}
      {serviceData.length===0&&<p className="md3-body-medium" style={{color:'var(--md-on-surface-variant)'}}>No services scheduled</p>}
    </div>}

    {tab==='history'&&<div style={{overflowX:'auto'}}><table><thead><tr><th>Name</th><th>Status</th><th>Room</th><th>Time</th></tr></thead><tbody>
      {history.map((c:any,i:number)=>(<tr key={i}><td><span className="md3-body-medium">{c.participant_name||c.participant}</span></td><td><span className="md3-badge" style={{background:c.status==='checked_in'?'var(--md-tertiary)':c.status==='arrived'?'var(--md-primary-container)':'var(--md-surface-container-high)',color:c.status==='checked_in'?'var(--md-on-tertiary)':c.status==='arrived'?'var(--md-on-primary-container)':'var(--md-on-surface)'}}>{c.status}</span></td><td><span className="md3-body-medium">{c.room_number||'-'}</span></td><td><span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>{c.checked_at||c.time||''}</span></td></tr>))}
    </tbody></table></div>}
  </div>);
}
