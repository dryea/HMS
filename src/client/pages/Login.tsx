import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PasswordInput, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconBuilding, IconArrowLeft } from '@tabler/icons-react';
import { api } from '../api/client';

export default function Login() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<string>('staff');
  const [step, setStep] = useState<'code'|'hotel'>('code');
  const [eventCode, setEventCode] = useState(searchParams.get('code')||'');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [eventInfo, setEventInfo] = useState<any>(null);

  const lookupEvent = async () => {
    if(!eventCode) return; setLoading(true);
    try {
      const res = await fetch('/api/events').then(r=>r.json());
      const ev = res.find((e:any)=>e.event_code===eventCode.toUpperCase());
      if(!ev||!ev.hotels?.length){notifications.show({title:'Error',message:'Event not found',color:'red'});setLoading(false);return;}
      setHotels(ev.hotels); setEventInfo(ev); setStep('hotel');
    } catch { notifications.show({title:'Error',message:'Could not find event',color:'red'}); }
    setLoading(false);
  };

  const selectHotel = async (hotel:any) => {
    setLoading(true);
    try {
      const code = eventCode.toUpperCase()+'-'+hotel.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').replace('hotel-','');
      const res = await api.auth.staff(code);
      sessionStorage.setItem('staff_session',JSON.stringify(res));
      nav('/staff/dashboard');
    } catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}
    setLoading(false);
  };

  const adminLogin = async () => {
    if(!password) return; setLoading(true);
    try { await api.auth.admin(password); sessionStorage.setItem('admin_token','true'); nav('/admin/events'); }
    catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}
    setLoading(false);
  };

  return (
    <div className="page-container" style={{maxWidth:400,marginTop:80}}>
      <div className="md3-card p-24">
        <h1 className="md3-headline-small m-0 mb-4" style={{textAlign:'center'}}>HMS</h1>
        <p className="md3-body-medium m-0 mb-24" style={{textAlign:'center',color:'var(--md-on-surface-variant)'}}>Hotel Management System</p>

        <div className="flex gap-8 mb-20" style={{background:'var(--md-surface-container-high)',borderRadius:9999,padding:4}}>
          <button className="md3-chip" data-selected={tab==='staff'} onClick={()=>setTab('staff')} style={{flex:1,justifyContent:'center'}}>Staff</button>
          <button className="md3-chip" data-selected={tab==='admin'} onClick={()=>setTab('admin')} style={{flex:1,justifyContent:'center'}}>Admin</button>
        </div>

        {tab==='staff' && (
          <div>
            {step==='code' ? (
              <div className="flex flex-col gap-12">
                <TextInput label="Event Code" placeholder="e.g. RBCBMC2026" value={eventCode} onChange={e=>setEventCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&lookupEvent()} />
                <p className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>Enter your event code to find your hotel</p>
                <button className="md3-btn" style={{width:'100%'}} onClick={lookupEvent} disabled={loading}>Find My Hotel</button>
              </div>
            ) : (
              <div className="flex flex-col gap-12">
                <button className="md3-btn-text" onClick={()=>setStep('code')} style={{alignSelf:'flex-start'}}><IconArrowLeft size={16}/> Change event</button>
                <p className="md3-title-medium m-0">Select your hotel for {eventInfo?.name}:</p>
                {hotels.map((h:any)=>(
                  <div key={h.id} className="md3-card p-16" style={{cursor:'pointer'}} onClick={()=>selectHotel(h)}>
                    <div className="flex items-center gap-12"><IconBuilding size={20} style={{color:'var(--md-primary)'}}/><span className="md3-title-medium m-0">{h.name}</span></div>
                    <p className="md3-body-small m-0 mt-4" style={{color:'var(--md-on-surface-variant)'}}>{h.address}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==='admin' && (
          <div className="flex flex-col gap-12">
            <PasswordInput label="Admin Password" placeholder="Enter password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&adminLogin()} />
            <button className="md3-btn" style={{width:'100%'}} onClick={adminLogin} disabled={loading}>Login</button>
          </div>
        )}
      </div>
    </div>
  );
}
