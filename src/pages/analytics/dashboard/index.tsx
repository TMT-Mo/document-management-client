import { Container } from '@mui/material'
import CustomizedProgressBars from 'components/Statistics'
import React from 'react'

export const AnalyticsDashboard = () => {
  return (
    <Container sx={{paddingY: '50px'}}><CustomizedProgressBars/></Container>
  )
}
