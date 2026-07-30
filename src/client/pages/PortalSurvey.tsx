import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Text, Card, Group, Button, Stack, TextInput, Radio, Rating, ActionIcon, Progress } from '@mantine/core';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

export default function PortalSurvey() {
  const { token } = useParams();
  const nav = useNavigate();
  const [survey, setSurvey] = useState<any>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if(token) fetch('/api/portal/'+token+'/survey').then(r=>r.json()).then(d=>{setSurvey(d.survey);setHasResponded(d.has_responded);}).catch(()=>{});
  }, [token]);

  const answered = survey?.questions?.filter((q:any)=>answers[q.id]!==undefined&&answers[q.id]!=='').length||0;
  const total = survey?.questions?.length||0;
  const progress = total ? Math.round((answered/total)*100) : 0;

  const submit = async () => {
    setSaving(true);
    try {
      await fetch('/api/portal/'+token+'/survey', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answers})});
      setHasResponded(true);
      notifications.show({title:'Thank you for your feedback!',color:'green'});
    } catch(e:any) { notifications.show({title:'Error',message:e.message,color:'red'}); }
    setSaving(false);
  };

  if(!survey) return <Container py="xl"><Text ta="center" c="dimmed">No survey available</Text></Container>;
  if(hasResponded) return (
    <Container py="xl">
      <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}}>
        <Card withBorder padding="lg" radius="md" ta="center">
          <IconCheck size={48} color="green" />
          <Title order={3} mt="md">Thank You!</Title>
          <Text c="dimmed">Your feedback has been recorded.</Text>
        </Card>
      </motion.div>
    </Container>
  );

  return (
    <Container size="sm" py="md">
      <Group mb="md"><ActionIcon variant="subtle" onClick={()=>nav(-1)}><IconArrowLeft size={20}/></ActionIcon><Title order={3}>{survey.title}</Title></Group>
      <Progress value={progress} mb="md" />
      <Text size="sm" c="dimmed" mb="md">{answered} of {total} answered ({progress}%)</Text>

      {survey.questions?.map((q:any, i:number) => (
        <motion.div key={q.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
          <Card withBorder mb="sm" padding="sm" radius="md">
            <Text fw={500} mb="sm">{i+1}. {q.question}</Text>
            {q.type === 'rating' && <Rating value={answers[q.id]||0} onChange={v=>setAnswers({...answers,[q.id]:v})} size="lg" />}
            {q.type === 'text' && <TextInput value={answers[q.id]||''} onChange={e=>setAnswers({...answers,[q.id]:e.target.value})} />}
            {q.type === 'choice' && (q.options||[]).map((opt:string)=>(
              <Radio key={opt} label={opt} value={opt} checked={answers[q.id]===opt} onChange={()=>setAnswers({...answers,[q.id]:opt})} mb={4} />
            ))}
          </Card>
        </motion.div>
      ))}
      <Button fullWidth onClick={submit} mt="md" loading={saving}>{progress===100?'Submit Feedback':`Submit (${progress}%)`}</Button>
    </Container>
  );
}
