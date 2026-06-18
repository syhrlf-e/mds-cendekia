export type OrganizationMember = {
  id: number
  nama: string
  jabatan: string
  gambar: string
  sambutan: string
  join_at: string
}

export type OrganizationCreatePayload = {
  nama: string
  jabatan: string
  sambutan: string
  join_at: string
  gambar?: File | null
}

export type OrganizationUpdatePayload = Partial<OrganizationCreatePayload>
