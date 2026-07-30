import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Text } from '@mantine/core';
import { api } from '../api/client';

export default function StaffCheckin() {
  const { code } = useParams();
  const nav = useNavigate();

  useEffect(() => {
    if (code) {
      api.auth.staff(code).then((res) => {
        sessionStorage.setItem('staff_session', JSON.stringify(res));
        nav('/staff/dashboard');
      }).catch(() => {
        nav('/?error=Invalid staff code');
      });
    } else {
      nav('/');
    }
  }, [code]);

  return <Container><Text>Redirecting...</Text></Container>;
}
