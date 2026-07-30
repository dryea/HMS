import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Text } from '@mantine/core';

export default function ParticipantQR() {
  const { token } = useParams();
  const nav = useNavigate();

  useEffect(() => {
    if (token) nav('/portal/' + token, { replace: true });
  }, [token]);

  return <Container><Text>Redirecting to your dashboard...</Text></Container>;
}
