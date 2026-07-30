import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Group, Button, Stack, TextInput, Text, Card, Badge, Switch, Table, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconChartBar } from '@tabler/icons-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminSurvey() {
  const { id: eventId } = useParams();
  const [survey, setSurvey] = useState<any>(null);
  const [responses, setResponses] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [active, setActive] = useState(false);
  const [event, setEvent] = useState<any>(null);

  const load = async () => {
    if (!eventId) return;
    try {
      const s = await (await fetch('/api/surveys/'+eventId)).json();
      setSurvey(s.id ? s : null);
      setQuestions(s.questions ? (typeof s.questions === 'string' ? JSON.parse(s.questions) : s.questions) : []);
      setActive(s.active ? true : false);
    } catch {}
    try { const r = await (await fetch('/api/surveys/'+eventId+'/responses')).json(); setResponses(r); } catch {}
    try { setEvent(await (await fetch('/api/events/'+eventId)).json()); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const addQuestion = () => setQuestions([...questions, { id: 'q'+Date.now(), question: '', type: 'rating', options: [] }]);

  const save = async () => {
    try {
      await fetch('/api/surveys/'+eventId, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ questions, active }) });
      notifications.show({ title: 'Survey saved', color:'green' }); load();
    } catch(e:any) { notifications.show({ title:'Error', message:e.message, color:'red' }); }
  };

  return (
    <Container pb={70}>
      <Breadcrumbs items={[
        {label:'Super Admin',href:'/admin'},{label:'Events',href:'/admin/events'},{label:event?.name||'',href:'/admin/events/'+eventId},{label:'Survey'}
      ]} />
      <Title order={3} mb="md">Post-Event Survey</Title>
      <Switch label="Survey Active" checked={active} onChange={e=>setActive(e.currentTarget.checked)} mb="md" />

      {questions.map((q:any, i:number) => (
        <Card key={q.id} withBorder mb="sm" padding="sm" radius="md">
          <Group mb={4}>
            <Text size="sm" fw={500}>Q{i+1}</Text>
            <select value={q.type} onChange={e=>{const qs=[...questions]; qs[i].type=e.target.value; setQuestions(qs);}}>
              <option value="rating">Rating (1-5)</option><option value="text">Text</option><option value="choice">Multiple Choice</option>
            </select>
            <ActionIcon size="sm" color="red" variant="subtle" onClick={() => setQuestions(questions.filter((_:any,idx:number)=>idx!==i))}><IconTrash size={14} /></ActionIcon>
          </Group>
          <TextInput placeholder="Question" value={q.question} onChange={e=>{const qs=[...questions]; qs[i].question=e.target.value; setQuestions(qs);}} />
          {q.type === 'choice' && (
            <TextInput mt={4} placeholder="Options (comma separated)" value={q.options?.join(',')||''}
              onChange={e=>{const qs=[...questions]; qs[i].options=e.target.value.split(',').map((s:string)=>s.trim()); setQuestions(qs);}} />
          )}
        </Card>
      ))}
      <Group mb="md">
        <Button variant="light" leftSection={<IconPlus size={14} />} onClick={addQuestion}>Add Question</Button>
        <Button onClick={save}>Save Survey</Button>
      </Group>

      {responses?.analytics && Object.keys(responses.analytics).length > 0 && (
        <Card withBorder padding="md" radius="md">
          <Title order={5} mb="sm">Results ({responses.total} responses)</Title>
          {Object.values(responses.analytics).map((a: any) => (
            <Stack key={a.question} gap={4} mb="md">
              <Text size="sm" fw={500}>{a.question}</Text>
              {a.type === 'rating' && (
                <Group gap={8}>
                  {[1,2,3,4,5].map(n => (
                    <Badge key={n} size="lg" variant="light">{n}: {a.counts[String(n)]||0}</Badge>
                  ))}
                </Group>
              )}
              {a.type === 'choice' && Object.entries(a.counts).map(([opt, cnt]:[string,any]) => (
                <Text key={opt} size="sm">{opt}: {cnt}</Text>
              ))}
            </Stack>
          ))}
        </Card>
      )}
    </Container>
  );
}
