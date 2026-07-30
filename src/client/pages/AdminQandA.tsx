import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Group, Card, Text, Badge, Button, Stack, ActionIcon, Table } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconEye, IconEyeOff, IconArrowUp } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminQandA() {
  const { id: eventId, sid } = useParams();
  const nav = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);

  const load = async () => {
    if(!eventId||!sid) return;
    try { setQuestions(await (await fetch('/api/event-config/sessions/'+eventId+'/'+sid+'/questions')).json()); } catch {}
    try { setSession(await (await fetch('/api/sessions/'+eventId)).json().then((s:any[])=>s.find((x:any)=>x.id===sid))); } catch {}
    try { setEvent(await (await fetch('/api/events/'+eventId)).json()); } catch {}
  };
  useEffect(() => { load(); }, [eventId, sid]);

  return (
    <Container pb={70}>
      <Breadcrumbs items={[{label:'Super Admin',href:'/admin'},{label:'Events',href:'/admin/events'},{label:event?.name||'',href:'/admin/events/'+eventId},{label:'Sessions',href:'/admin/events/'+eventId+'/sessions'},{label:session?.title||'Q&A'}]} />
      <Group mb="md"><Title order={3}>Q&A: {session?.title}</Title></Group>
      {questions.length === 0 ? (
        <Card withBorder padding="xl" ta="center"><Text c="dimmed">No questions yet</Text></Card>
      ) : (
        <Stack>
          {questions.map((q:any) => (
            <Card key={q.id} withBorder padding="sm" radius="md" style={{opacity:q.hidden?0.5:1}}>
              <Group justify="space-between">
                <Stack gap={4} style={{flex:1}}>
                  <Text fw={500}>{q.question}</Text>
                  <Group gap={4}>
                    <Badge size="sm" color={q.answered?'green':'gray'}>{q.answered?'Answered':'Pending'}</Badge>
                    <Text size="xs" c="dimmed">by {q.participant_name}</Text>
                    <Text size="xs" c="dimmed">{q.upvotes} upvotes</Text>
                  </Group>
                </Stack>
                <Group gap={4}>
                  <ActionIcon size="sm" variant="subtle" color={q.answered?'green':'gray'} onClick={async()=>{await fetch('/api/event-config/sessions/'+eventId+'/'+sid+'/questions/'+q.id+'/answer',{method:'POST'});load();}}><IconCheck size={14} /></ActionIcon>
                  <ActionIcon size="sm" variant="subtle" onClick={async()=>{await fetch('/api/event-config/sessions/'+eventId+'/'+sid+'/questions/'+q.id+'/hide',{method:'POST'});load();}}>{q.hidden?<IconEye size={14} />:<IconEyeOff size={14} />}</ActionIcon>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
