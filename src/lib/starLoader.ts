export type Star = {
  id: number
  name?: string
  ra_deg: number
  dec_deg: number
  dist_pc: number
  mag: number
  bv?: number
}

export async function loadSampleStars(): Promise<Star[]> {
  try {
    const res = await fetch('/data/stars_sample.json')
    if (!res.ok) throw new Error('HTTP '+res.status)
    const data = await res.json()
    return data as Star[]
  } catch (e) {
    console.warn('Failed to load sample stars from /data/stars_sample.json, falling back to built-in array', e)
    return [
      { id:1, name:'Sirius', ra_deg:101.28715533, dec_deg:-16.71611586, dist_pc:2.637, mag:-1.46, bv:0.00 },
      { id:2, name:'Canopus', ra_deg:95.987877, dec_deg:-52.695661, dist_pc:95.0, mag:-0.74, bv:0.15 },
      { id:3, name:'Alpha Centauri', ra_deg:219.90205833, dec_deg:-60.8339925, dist_pc:1.347, mag:-0.27, bv:0.71 },
      { id:4, name:'Arcturus', ra_deg:213.915300, dec_deg:19.1824, dist_pc:11.26, mag:-0.05, bv:1.23 },
      { id:5, name:'Vega', ra_deg:279.23473479, dec_deg:38.78368896, dist_pc:7.68, mag:0.03, bv:0.00 }
    ]
  }
}
