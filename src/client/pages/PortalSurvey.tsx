import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Text, Card, Group, Button, Stack, TextInput, Radio, Rating, ActionIcon } from '@mantine/core';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

export default function PortalSurvey() {
  const { token } = useParams();
  const nav = useNavigate();
  const [survey, setSurvey] = useState<any>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (token) fetch('/api/portal/'+token+'/survey').then(r=>r.json()).then(d => {
      setSurvey(d.survey);
      setHasResponded(d.has_responded);
    }).catch(() => {});
  }, [token]);

  const submit = async () => {
    try {
      await fetch('/api/portal/'+token+'/survey', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ answers }) });
      setHasResponded(true);
      notifications.show({ title: 'Thank you for your feedback!', color:'green' });
    } catch(e: any) { notifications.show({ title:'Error', message:e.message, color:'red' }); }
  };

  if (!survey) return <Container><Text>No survey available</Text></Container>;
  if (hasResponded) return <Container py="xl"><Card withBorder padding="lg" radius="md" ta="center"><IconCheck size={48} color="green" /><Title order={3} mt="md">Thank You!</Title><Text c="dimmed">Your feedback has been recorded.</Text></Card></Container>;

  return (
    <Container size="sm" py="md">
      <Group mb="md"><ActionIcon variant="subtle" onClick={() => nav(-1)}><IconArrowLeft size={20} /></ActionIcon><Title order={3}>{survey.title}</Title></Group>
      {survey.questions?.map((q: any, i: number) => (
        <Card key={q.id} withBorder mb="sm" padding="sm" radius="md">
          <Text fw={500} mb="sm">{i+1}. {q.question}</Text>
          {q.type === 'rating' && <Rating value={answers[q.id]||0} onChange={v => setAnswers({...answers, [q.id]: v})} size="lg" />}
          {q.type === 'text' && <TextInput value={answers[q.id]||''} onChange={e => setAnswers({...answers, [q.id]: e.target.value})} />}
          {q.type === 'choice' && (q.options||[]).map((opt: string) => (
            <Radio key={opt} label={opt} value={opt} checked={answers[q.id]===opt} onChange={() => setAnswers({...answers, [q.id]: opt})} mb={4} />
          ))}
        </Card>
      ))}
      <Button fullWidth onClick={submit} mt="md">Submit Feedback</Button>
    </Container>
  );
}
