import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Text, Badge, Button } from '@mantine/core';
import { IconCheck, IconEye, IconEyeOff, IconArrowUp } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export default function AdminQandA() {
  const {id:eventId,sid}=useParams();
  const [questions,setQuestions]=useState<any[]>([]);
  const [session,setSession]=useState<any>(null);
  const load=async()=>{if(!eventId||!sid)return;try{setQuestions(await(await fetch('/api/event-config/sessions/'+eventId+'/'+sid+'/questions')).json());}catch{}try{const s=await(await fetch('/api/sessions/'+eventId)).json();setSession(s.find((x:any)=>x.id===sid));}catch{}};
  useEffect(()=>{load();},[eventId,sid]);
  return(<div className="page-container">
    <h1 className="md3-headline-small m-0 mb-20">Q&A: {session?.title}</h1>
    {questions.length===0?(<div className="md3-card p-24" style={{textAlign:'center'}}><p className="md3-body-medium" style={{color:'var(--md-on-surface-variant)'}}>No questions yet</p></div>):<div className="flex flex-col gap-12">{questions.map((q:any)=>(<div key={q.id} className="md3-card p-16" style={{opacity:q.hidden?0.5:1}}>
      <div className="flex items-start justify-between"><div style={{flex:1}}>
        <p className="md3-body-medium" style={{fontWeight:500}}>{q.question}</p>
        <div className="flex items-center gap-4 mt-4"><span className="md3-badge" style={{background:q.answered?'var(--md-tertiary)':'var(--md-surface-container-high)',color:q.answered?'var(--md-on-tertiary)':'var(--md-on-surface)'}}>{q.answered?'Answered':'Pending'}</span><span className="md3-body-small" style={{color:'var(--md-on-surface-variant)'}}>by {q.participant_name} · {q.upvotes} upvotes</span></div>
      </div><div className="flex gap-4"><button className="md3-btn-text" style={{height:32,width:32,padding:0}} onClick={async()=>{await fetch('/api/event-config/sessions/'+eventId+'/'+sid+'/questions/'+q.id+'/answer',{method:'POST'});load();}}><IconCheck size={16} style={{color:q.answered?'var(--md-tertiary)':'var(--md-on-surface-variant)'}}/></button><button className="md3-btn-text" style={{height:32,width:32,padding:0}} onClick={async()=>{await fetch('/api/event-config/sessions/'+eventId+'/'+sid+'/questions/'+q.id+'/hide',{method:'POST'});load();}}>{q.hidden?<IconEye size={16}/>:<IconEyeOff size={16}/>}</button></div></div>
    </div>))}</div>}
  </div>);
}
