// src/db.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export async function createUser({ nickname, characterType, frameColor, roomStyle }) {
  const { data, error } = await supabase
    .from('users')
    .insert({ nickname, character_type: characterType, frame_color: frameColor, room_style: roomStyle })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function fetchUserByNickname(nickname) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('nickname', nickname)
    .single()
  return data ?? null
}

export async function fetchAllUsers() {
  const { data, error } = await supabase.from('users').select('*')
  if (error) throw error
  return data
}

export async function updateRoomStyle(userId, roomStyle) {
  const { error } = await supabase
    .from('users')
    .update({ room_style: roomStyle })
    .eq('id', userId)
  if (error) throw error
}

export async function fetchPoopsInHouse(houseOwnerId) {
  const { data, error } = await supabase
    .from('poops')
    .select('*, depositor:depositor_id(nickname, character_type)')
    .eq('house_owner_id', houseOwnerId)
    .eq('is_cleaned', false)
  if (error) throw error
  return data
}

export async function createPoop(houseOwnerId, depositorId) {
  const { data, error } = await supabase
    .from('poops')
    .insert({ house_owner_id: houseOwnerId, depositor_id: depositorId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function cleanPoop(poopId) {
  const { error } = await supabase
    .from('poops')
    .update({ is_cleaned: true })
    .eq('id', poopId)
  if (error) throw error
}

export async function cleanAllPoops(houseOwnerId) {
  const { error } = await supabase
    .from('poops')
    .update({ is_cleaned: true })
    .eq('house_owner_id', houseOwnerId)
    .eq('is_cleaned', false)
  if (error) throw error
}
