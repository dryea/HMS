import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { TextInput } from '@mantine/core';

export default function PortalDietary() {
  const {token}=useParams();const nav=useNavigate();
  const [dietary,setDietary]=useState('');
  useEffect(()=>{if(token)fetch('/api/portal/'+token+'/dietary').then(r=>r.json()).then(d=>setDietary(d.dietary||'')).catch(()=>{});},[token]);
  const save=async()=>{try{await fetch('/api/portal/'+token+'/dietary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dietary})});notifications.show({title:'Saved',color:'green'});}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  return(<div className="page-container" style={{maxWidth:480}}>
    <div className="flex items-center gap-8 mb-20"><button className="md3-btn-text" onClick={()=>nav(-1)}><IconArrowLeft size={20}/></button><h1 className="md3-headline-small m-0">Dietary Preferences</h1></div>
    <div className="md3-card p-20"><p className="md3-body-medium mb-16">Let us know about any dietary requirements.</p>
      <select className="md3-text-field" style={{minHeight:44,marginBottom:12}} value={dietary} onChange={e=>setDietary(e.target.value)}>
        <option value="">No preference</option><option value="Vegetarian">Vegetarian</option><option value="Vegan">Vegan</option><option value="Gluten-free">Gluten-free</option><option value="Halal">Halal</option><option value="Other">Other</option></select>
      <input className="md3-text-field" style={{minHeight:44}} placeholder="Additional notes" value={dietary} onChange={e=>setDietary(e.target.value)} />
      <button className="md3-btn" style={{width:'100%',marginTop:12}} onClick={save}>Save Preferences</button>
    </div>
  </div>);
}
