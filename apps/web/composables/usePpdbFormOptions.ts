export type ProgramOption = {
  label: string
  value: string
  description: string
}

export const agamaOptions = [
  { label: 'Islam', value: 'Islam' },
  { label: 'Kristen', value: 'Kristen' },
  { label: 'Katolik', value: 'Katolik' },
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Buddha', value: 'Buddha' },
  { label: 'Konghucu', value: 'Konghucu' }
]

export const pendidikanOptions = [
  { label: 'Tidak Sekolah', value: 'Tidak Sekolah' },
  { label: 'SD/Sederajat', value: 'SD' },
  { label: 'SMP/Sederajat', value: 'SMP' },
  { label: 'SMA/Sederajat', value: 'SMA' },
  { label: 'D1/D2/D3', value: 'Diploma' },
  { label: 'S1/D4', value: 'S1' },
  { label: 'S2', value: 'S2' },
  { label: 'S3', value: 'S3' }
]

export const gajiOptions = [
  { label: 'Kurang dari Rp 1.000.000', value: '1000000' },
  { label: 'Rp 1.000.000 - Rp 2.000.000', value: '2000000' },
  { label: 'Rp 2.000.000 - Rp 5.000.000', value: '5000000' },
  { label: 'Rp 5.000.000 - Rp 10.000.000', value: '10000000' },
  { label: 'Lebih dari Rp 10.000.000', value: '10000001' }
]

export const waliHubunganOptions = [
  { label: 'Wali', value: 'Wali' },
  { label: 'Paman', value: 'Paman' },
  { label: 'Bibi', value: 'Bibi' },
  { label: 'Kakek', value: 'Kakek' },
  { label: 'Nenek', value: 'Nenek' },
  { label: 'Kakak', value: 'Kakak' },
  { label: 'Saudara', value: 'Saudara' },
  { label: 'Orang Tua Asuh', value: 'Orang Tua Asuh' },
  { label: 'Lainnya', value: 'Lainnya' }
]

export const createDefaultProgramOptions = (programId: unknown): ProgramOption[] => [
  {
    label: 'Paket C',
    value: String(programId || 1),
    description: 'Setara SMA'
  }
]
