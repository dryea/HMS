import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextInput, Rating } from '@mantine/core';
import { IconArrowLeft, IconMessage, IconStar } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export default function PortalSessionDetail() {
  const {token,sid}=useParams();const nav=useNavigate();
  const [session,setSession]=useState<any>(null);const [questions,setQuestions]=useState<any[]>([]);
  const [newQuestion,setNewQuestion]=useState('');const [feedback,setFeedback]=useState<Record<string,any>>({});
  const [tab,setTab]=useState<string>('info');
  const load=async()=>{if(!token||!sid)return;try{setSession(await(await fetch('/api/portal/'+token+'/sessions/'+sid)).json());}catch{}try{setQuestions(await(await fetch('/api/event-config/sessions/_/'+sid+'/questions')).json());}catch{}};
  useEffect(()=>{load();},[token,sid]);
  if(!session)return<div className="page-container"><p>Loading...</p></div>;
  return(<div className="page-container" style={{maxWidth:480}}>
    <div className="flex items-center gap-8 mb-20"><button className="md3-btn-text" onClick={()=>nav(-1)}><IconArrowLeft size={20}/></button><h1 className="md3-headline-small m-0">{session.title}</h1></div>
    <div className="flex gap-4 mb-16" style={{background:'var(--md-surface-container-high)',borderRadius:9999,padding:4}}>
      {['info','qa','feedback'].map(t=><button key={t} className="md3-chip" data-selected={tab===t} onClick={()=>setTab(t)} style={{flex:1,justifyContent:'center'}}>{t==='info'?'Info':t==='qa'?`Q&A (${session.question_count||0})`:'Feedback'}</button>)}
    </div>
    {tab==='info'&&<div>{session.description&&<p className="md3-body-medium">{session.description}</p>}<div className="flex gap-8 mt-12 flex-wrap">{session.speaker_name&&<span className="md3-chip" data-selected style={{cursor:'default'}}>{session.speaker_name}</span>}{session.location_name&&<span className="md3-chip" style={{cursor:'default'}}>{session.location_name}</span>}<span className="md3-chip" style={{cursor:'default'}}>{session.start_time}-{session.end_time}</span></div></div>}
    {tab==='qa'&&<div><div className="flex gap-8 mb-12"><input className="md3-text-field" style={{flex:1,minHeight:44}} placeholder="Ask a question..." value={newQuestion} onChange={e=>setNewQuestion(e.target.value)} /><button className="md3-btn" onClick={async()=>{if(!newQuestion)return;try{await fetch('/api/portal/'+token+'/sessions/'+sid+'/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:newQuestion})});setNewQuestion('');load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>Ask</button></div>
      {questions.map((q:any)=>(<div key={q.id} className="md3-card p-12 mb-8"><p className="md3-body-medium">{q.question}</p><div className="flex gap-4 mt-4"><span className="md3-badge" style={{background:q.answered?'var(--md-tertiary)':'var(--md-surface-container-high)'}}>{q.answered?'Answered':'Open'}</span></div></div>))}</div>}
    {tab==='feedback'&&<div className="md3-card p-20"><p className="md3-body-medium mb-8">Rate this session</p><Rating value={feedback.rating||0} onChange={v=>setFeedback({...feedback,rating:v})} size="lg" mb={12}/><input className="md3-text-field" style={{minHeight:44}} placeholder="Comments?" value={feedback.comment||''} onChange={e=>setFeedback({...feedback,comment:e.target.value})} /><button className="md3-btn mt-12" style={{width:'100%'}} disabled={!feedback.rating} onClick={async()=>{try{await fetch('/api/event-config/sessions/_/'+sid+'/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rating:feedback.rating,comment:feedback.comment||''})});notifications.show({title:'Feedback submitted',color:'green'});load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}}}>Submit</button></div>}
  </div>);
}
