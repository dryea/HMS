import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TextInput, ColorInput, SimpleGrid, Image, FileInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPalette } from '@tabler/icons-react';

export default function AdminBranding() {
  const {id:eventId}=useParams();
  const [logo,setLogo]=useState('');
  const [bannerColor,setBannerColor]=useState('#1C1B1B');
  const [accentColor,setAccentColor]=useState('#8C4A48');
  const load=async()=>{if(!eventId)return;try{const b=await(await fetch('/api/branding/'+eventId)).json();setLogo(b.logo_url||'');setBannerColor(b.banner_color||'#1C1B1B');setAccentColor(b.accent_color||'#8C4A48');}catch{}};
  useEffect(()=>{load();},[eventId]);
  const save=async()=>{try{await fetch('/api/branding/'+eventId,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({logo_url:logo,banner_color:bannerColor,accent_color:accentColor})});notifications.show({title:'Branding updated',color:'green'});}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  const uploadLogo=async(file:File|null)=>{if(!file)return;const fd=new FormData();fd.append('file',file);try{const r=await(await fetch('/api/event-config/upload/logo/'+eventId,{method:'POST',body:fd})).json();setLogo(r.url);notifications.show({title:'Logo uploaded',color:'green'});}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  return(<div className="page-container">
    <h1 className="md3-headline-small m-0 mb-20"><IconPalette size={24} style={{verticalAlign:'middle',marginRight:8}}/>Event Branding</h1>
    <div className="md3-card p-24"><div className="flex flex-col gap-16">
      <div><p className="md3-label-medium mb-8">Logo</p>{logo&&<Image src={'https://hms.sudeepdhakal.workers.dev/'+logo} h={80} fit="contain" mb={8} />}<FileInput accept="image/png,image/jpeg" placeholder="Upload logo" onChange={uploadLogo} /></div>
      <SimpleGrid cols={2}><ColorInput label="Banner Color" value={bannerColor} onChange={setBannerColor} /><ColorInput label="Accent Color" value={accentColor} onChange={setAccentColor} /></SimpleGrid>
      <div style={{background:`linear-gradient(135deg, ${bannerColor}, ${accentColor})`,padding:20,borderRadius:16}}><p style={{color:'white',fontSize:22,fontWeight:400,margin:0}}>Preview</p><p style={{color:'white',opacity:0.9,margin:0,fontSize:14}}>Participant portal will use these colors</p></div>
      <button className="md3-btn" style={{width:'100%'}} onClick={save}>Save Branding</button>
    </div></div>
  </div>);
}
