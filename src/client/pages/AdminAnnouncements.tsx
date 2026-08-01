import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, TextInput, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconBell, IconSend } from '@tabler/icons-react';

export default function AdminAnnouncements() {
  const {id:eventId}=useParams();
  const [announcements,setAnnouncements]=useState<any[]>([]);
  const [opened,{open,close}]=useDisclosure(false);
  const [form,setForm]=useState({title:'',message:'',priority:'normal'});
  const load=async()=>{if(!eventId)return;try{setAnnouncements(await(await fetch('/api/announcements/'+eventId)).json());}catch{}};
  useEffect(()=>{load();},[eventId]);
  const send=async()=>{try{await fetch('/api/announcements/'+eventId,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});notifications.show({title:'Sent',message:'Announcement sent successfully.',color:'green'});close();setForm({title:'',message:'',priority:'normal'});load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  return(<div className="page-container">
    <div className="flex items-center justify-between mb-20"><h1 className="md3-headline-small m-0">Announcements</h1>      <button className="md3-btn" style={{height:36,padding:'0 16px'}} onClick={async()=>{
        const subs = (await (await fetch('/api/system/push/subscriptions?event_id='+eventId)).json()) as any;
        if(!subs.length){notifications.show({title:'No subscribers',message:'No participants subscribed to push yet',color:'red'});return;}
        await fetch('/api/system/push/broadcast',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event_id:eventId,title:'New announcement',message:'Check your announcements'})});
        notifications.show({title:'Queued Broadcast',message:'Queued to '+subs.length+' subscribers',color:'green'});
      }}><IconSend size={16}/> Push</button>
      <button className="md3-btn" onClick={open}><IconPlus size={18}/> New</button></div>
    {announcements.map((a:any)=>(<div key={a.id} className="md3-card p-16 mb-12">
      <div className="flex items-center gap-8 mb-4"><IconBell size={18} style={{color:'var(--md-primary)'}}/><span className="md3-title-medium">{a.title}</span><span className="md3-badge" style={{background:a.priority==='high'?'var(--md-error)':'var(--md-surface-container-high)',color:a.priority==='high'?'var(--md-on-error)':'var(--md-on-surface)'}}>{a.priority}</span><span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>{a.read_count||0} reads</span></div>
      <p className="md3-body-medium m-0">{a.message}</p>
      <p className="md3-body-small mt-4" style={{color:'var(--md-on-surface-variant)'}}>{a.created_at}</p>
    </div>))}
    <Modal opened={opened} onClose={close} title="New Announcement" fullScreen><div className="flex flex-col gap-12">
      <TextInput label="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
      <Textarea label="Message" minRows={4} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} />
      <select className="md3-text-field" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={{minHeight:44}}><option value="normal">Normal</option><option value="high">High Priority</option></select>
      <button className="md3-btn" style={{width:'100%'}} onClick={send}>Send to All</button>
    </div></Modal>
  </div>);
}
