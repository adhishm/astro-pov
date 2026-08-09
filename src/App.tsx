import React, { useEffect, useState } from 'react'
import { CssBaseline, Container, Paper, Box, Typography, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Slider, Button } from '@mui/material'
import SkyViewer from './components/SkyViewer'
import { loadSampleStars, Star } from './lib/starLoader'

export default function App() {
  const [stars, setStars] = useState<Star[]>([])
  const [showConstellations, setShowConstellations] = useState(true)
  const [magCutoff, setMagCutoff] = useState(6)
  const [observer, setObserver] = useState<'origin'|'alpha_centauri'>('origin')

  useEffect(() => {
    loadSampleStars().then(setStars)
  }, [])

  const filtered = stars.filter(s => s.mag <= magCutoff)

  return (
    <>
      <CssBaseline />
      <Container maxWidth={false} disableGutters>
        <Box display="flex" height="100vh">
          <Box flexGrow={1}>
            <SkyViewer stars={filtered} observerOption={observer} />
          </Box>
          <Box width={320} p={2}>
            <Paper elevation={3} sx={{p:2}}>
              <Typography variant="h6">Controls</Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel id="observer-label">Observer</InputLabel>
                <Select labelId="observer-label" value={observer} label="Observer" onChange={(e)=>setObserver(e.target.value as any)}>
                  <MenuItem value="origin">Origin (Sun / Solar System Barycenter)</MenuItem>
                  <MenuItem value="alpha_centauri">Alpha Centauri</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel control={<Switch checked={showConstellations} onChange={(e)=>setShowConstellations(e.target.checked)} />} label="Show constellations" />

              <Box mt={2}>
                <Typography gutterBottom>Magnitude cutoff: {magCutoff}</Typography>
                <Slider value={magCutoff} min={-2} max={10} step={0.1} onChange={(e, v)=>setMagCutoff(v as number)} />
              </Box>

              <Box mt={2}>
                <Button variant="contained" onClick={()=>{ localStorage.removeItem('starCatalogUrl'); alert('Reset remote catalog preference (if any).') }}>Reset remote catalog</Button>
              </Box>

            </Paper>
          </Box>
        </Box>
      </Container>
    </>
  )
}
