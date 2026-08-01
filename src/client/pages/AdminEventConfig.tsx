import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TextInput, Textarea, ColorInput, SimpleGrid, FileInput, Image, Tabs, Card, Table, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPalette, IconCalendar, IconSettings, IconPlus } from '@tabler/icons-react';

export default function AdminEventConfig() {
  const {id:eventId}=useParams();
  const [tab,setTab]=useState<string|null>('general');
  const [form,setForm]=useState({name:'',description:'',start_date:'',end_date:''});
  const [branding,setBranding]=useState({logo_url:'',banner_color:'#1C1B1B',accent_color:'#8C4A48'});
  const [customTypes,setCustomTypes]=useState<any[]>([]);
  const [newTypeName,setNewTypeName]=useState('');
  const load=async()=>{if(!eventId)return;try{const ev=await(await fetch('/api/events/'+eventId)).json();setForm({name:ev.name,description:ev.description||'',start_date:ev.start_date,end_date:ev.end_date});}catch{}try{const b=await(await fetch('/api/branding/'+eventId)).json();setBranding({logo_url:b.logo_url||'',banner_color:b.banner_color||'#1C1B1B',accent_color:b.accent_color||'#8C4A48'});}catch{}try{setCustomTypes(await(await fetch('/api/event-config/service-types/'+eventId)).json());}catch{}};
  useEffect(()=>{load();},[eventId]);
  const saveEvent=async()=>{try{await fetch('/api/events/'+eventId,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});notifications.show({title:'Saved',color:'green'});}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  const saveBranding=async()=>{try{await fetch('/api/branding/'+eventId,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(branding)});notifications.show({title:'Branding saved',color:'green'});}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  const addCustomType=async()=>{if(!newTypeName)return;try{await fetch('/api/event-config/service-types',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event_id:eventId,name:newTypeName})});setNewTypeName('');load();notifications.show({title:'Service type added',color:'green'});}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  const uploadLogo=async(file:File|null)=>{if(!file)return;const fd=new FormData();fd.append('file',file);try{const r=await(await fetch('/api/event-config/upload/logo/'+eventId,{method:'POST',body:fd})).json();setBranding({...branding,logo_url:r.url});notifications.show({title:'Logo uploaded',color:'green'});}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  return(<div className="page-container">
    <h1 className="md3-headline-small m-0 mb-20"><IconSettings size={24} style={{verticalAlign:'middle',marginRight:8}}/>Event Configuration</h1>
    <Tabs value={tab} onChange={setTab}><Tabs.List grow mb="md">
      <Tabs.Tab value="general" leftSection={<IconCalendar size={14}/>}>General</Tabs.Tab>
      <Tabs.Tab value="branding" leftSection={<IconPalette size={14}/>}>Branding</Tabs.Tab>
      <Tabs.Tab value="services" leftSection={<IconPlus size={14}/>}>Services</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="general"><div className="md3-card p-24"><div className="flex flex-col gap-12">
      <TextInput label="Event Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
      <Textarea label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
      <SimpleGrid cols={2}><TextInput label="Start Date" type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} /><TextInput label="End Date" type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} /></SimpleGrid>
      <button className="md3-btn" style={{width:'100%'}} onClick={saveEvent}>Save Changes</button>
    </div></div></Tabs.Panel>
    <Tabs.Panel value="branding"><div className="md3-card p-24"><div className="flex flex-col gap-16">
      <div><p className="md3-label-medium mb-8">Logo</p>{branding.logo_url&&<Image src={'https://hms.sudeepdhakal.workers.dev/'+branding.logo_url} h={80} fit="contain" mb={8} />}<FileInput accept="image/png,image/jpeg" placeholder="Upload logo" onChange={uploadLogo} /></div>
      <SimpleGrid cols={2}><ColorInput label="Banner" value={branding.banner_color} onChange={v=>setBranding({...branding,banner_color:v})} /><ColorInput label="Accent" value={branding.accent_color} onChange={v=>setBranding({...branding,accent_color:v})} /></SimpleGrid>
      <div style={{background:`linear-gradient(135deg, ${branding.banner_color}, ${branding.accent_color})`,padding:20,borderRadius:16}}><p style={{color:'white',fontSize:22,margin:0}}>Preview</p></div>
      <button className="md3-btn" style={{width:'100%'}} onClick={saveBranding}>Save Branding</button>
    </div></div></Tabs.Panel>
    <Tabs.Panel value="services"><div className="md3-card p-24">
      <p className="md3-title-medium m-0 mb-12">Custom Service Types</p>
      <div className="flex gap-8 mb-12"><input className="md3-text-field" style={{flex:1,minHeight:40,padding:'0 12px'}} placeholder="New service name" value={newTypeName} onChange={e=>setNewTypeName(e.target.value)} /><button className="md3-btn" onClick={addCustomType}><IconPlus size={18}/></button></div>
      <Table><thead><tr><th>Name</th><th>Type</th></tr></thead><tbody>{customTypes.map((t:any)=>(<tr key={t.id}><td><span className="md3-body-medium">{t.name}</span></td><td><span className="md3-badge" style={{background:t.event_id?'var(--md-tertiary-container)':'var(--md-surface-container-high)',color:t.event_id?'var(--md-on-tertiary-container)':'var(--md-on-surface)'}}>{t.event_id?'Custom':'System'}</span></td></tr>))}</tbody></Table>
    </div></Tabs.Panel>
    </Tabs>
  </div>);
}
