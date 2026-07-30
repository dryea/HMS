import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Text, Card, Group, Badge, Button, Stack, TextInput, Textarea, ActionIcon, Rating, Table, Tabs, Paper } from '@mantine/core';
import { IconArrowLeft, IconArrowUp, IconCheck, IconMessage, IconStar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';

export default function PortalSessionDetail() {
  const { token, sid } = useParams();
  const nav = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [feedback, setFeedback] = useState<Record<string, any>>({});
  const [tab, setTab] = useState<string|null>('info');

  const load = async () => {
    if(!token||!sid) return;
    try { setSession(await (await fetch('/api/portal/'+token+'/sessions/'+sid)).json()); } catch {}
    try { setQuestions(await (await fetch('/api/event-config/sessions/_/'+sid+'/questions')).json()); } catch {}
  };
  useEffect(() => { load(); }, [token, sid]);

  const submitQuestion = async () => {
    if(!newQuestion) return;
    const p = session; // has participant context from session data
    try {
      await fetch('/api/portal/'+token+'/sessions/'+sid+'/questions', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:newQuestion})});
      setNewQuestion(''); notifications.show({title:'Question submitted',color:'green'}); load();
    } catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}
  };

  const submitFeedback = async () => {
    try {
      await fetch('/api/event-config/sessions/_/'+sid+'/feedback', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rating:feedback.rating,comment:feedback.comment||''})});
      notifications.show({title:'Feedback submitted',color:'green'}); load();
    } catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}
  };

  if(!session) return <Container><Text>Loading...</Text></Container>;

  return (
    <Container size="sm" py="md">
      <Group mb="md"><ActionIcon variant="subtle" onClick={()=>nav(-1)}><IconArrowLeft size={20}/></ActionIcon><Title order={3}>{session.title}</Title></Group>
      {session.subtitle && <Text c="dimmed" mb="md">{session.subtitle}</Text>}
      
      <Tabs value={tab} onChange={setTab}>
        <Tabs.List grow mb="md">
          <Tabs.Tab value="info">Info</Tabs.Tab>
          <Tabs.Tab value="qa" leftSection={<IconMessage size={14}/>}>Q&A ({session.question_count||0})</Tabs.Tab>
          <Tabs.Tab value="feedback" leftSection={<IconStar size={14}/>}>Feedback</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="info">
          {session.banner_image_url && <img src={session.banner_image_url} style={{width:'100%',borderRadius:8,marginBottom:12}} />}
          <Text>{session.description}</Text>
          <Group mt="md">
            {session.speaker_name && <Badge size="lg">{session.speaker_name}</Badge>}
            {session.location_name && <Badge size="lg" variant="light">{session.location_name}</Badge>}
            <Badge size="lg" variant="outline">{session.start_time}-{session.end_time}</Badge>
          </Group>
          {session.speaker_bio && <Card withBorder mt="md" padding="sm"><Text size="sm">{session.speaker_bio}</Text></Card>}
        </Tabs.Panel>

        <Tabs.Panel value="qa">
          <TextInput placeholder="Ask a question..." value={newQuestion} onChange={e=>setNewQuestion(e.target.value)} mb="md" />
          <Button fullWidth onClick={submitQuestion} mb="md">Submit Question</Button>
          {questions.map((q:any) => (
            <Card key={q.id} withBorder mb="xs" padding="sm" radius="sm">
              <Group justify="space-between">
                <Text size="sm" style={{flex:1}}>{q.question}</Text>
                {q.answered && <IconCheck size={14} color="green" />}
              </Group>
              <Group mt={4}>
                <Badge size="xs" color={q.answered?'green':'gray'}>{q.answered?'Answered':'Open'}</Badge>
                <Text size="xs" c="dimmed">{q.upvotes} upvotes</Text>
              </Group>
            </Card>
          ))}
        </Tabs.Panel>

        <Tabs.Panel value="feedback">
          <Card withBorder padding="md" radius="md">
            <Text fw={500} mb="sm">Rate this session</Text>
            <Rating value={feedback.rating||0} onChange={v=>setFeedback({...feedback,rating:v})} size="lg" mb="md" />
            <Textarea placeholder="Any comments?" value={feedback.comment||''} onChange={e=>setFeedback({...feedback,comment:e.target.value})} mb="md" />
            <Button onClick={submitFeedback} disabled={!feedback.rating}>Submit Feedback</Button>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
