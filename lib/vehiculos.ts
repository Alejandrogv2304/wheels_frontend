/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api'

export interface CatalogoItem {
  id?: string | number
  marca: string
  referencia: string
  tipo: string
}

export interface Vehiculo {
  id?: string | number
  marca: string
  referencia: string
  placa: string
  tipo: string
  color?: string
  capacidad?: number
}

export async function getCatalogo(params?: Record<string, any>) {
  const res = await api.get('/catalogo', { params })
  return res.data
}

export async function postCatalogo(item: CatalogoItem) {
  const res = await api.post('/catalogo', item)
  return res.data
}

export async function getVehiculos() {
  const res = await api.get('/vehiculo')
  return res.data
}

export async function createVehiculo(v: Vehiculo) {
  const res = await api.post('/vehiculo', v)
  return res.data
}

export async function deleteVehiculo(id: string | number) {
  const res = await api.post(`/vehiculo/${id}/eliminar`)
  return res.data
}
