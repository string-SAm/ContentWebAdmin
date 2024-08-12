import React, { useMemo } from 'react'
import packageJson from '../../../../package.json';
import { Container } from '@mui/material';
const Footer = () => {
    const version =useMemo(()=>packageJson?.version,[packageJson?.version]);
  return (
    <Container className='text-center'><span className='text-muter'>version:{version}</span></Container>
  )
}

export default Footer