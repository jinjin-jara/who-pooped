// src/realtime.js
import { supabase } from './db.js'
import { getState } from './state.js'

// Active channels keyed by roomOwnerId
const channels = {}

export function joinRoomChannel(roomOwnerId, callbacks = {}) {
  const { onPoop, onClean, onPresence, onKick } = callbacks
  const state = getState()
  const channelName = `room:${roomOwnerId}`

  // Already subscribed to this channel — skip
  if (channels[channelName]) return

  const channel = supabase.channel(channelName, {
    config: {
      presence: { key: state.userId ?? 'anon' },
    },
  })

  channel
    .on('presence', { event: 'sync' }, () => {
      if (!onPresence) return
      const raw = channel.presenceState()
      // presenceState() returns { key: [{ ...payload }] }
      const list = Object.values(raw).flat()
      onPresence(list)
    })
    .on('broadcast', { event: 'poop' }, ({ payload }) => {
      if (onPoop) onPoop(payload)
    })
    .on('broadcast', { event: 'clean' }, ({ payload }) => {
      if (onClean) onClean(payload)
    })
    .on('broadcast', { event: 'kick' }, ({ payload }) => {
      if (onKick) onKick(payload.targetId)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId:   state.userId,
          nickname: state.nickname,
        })
      }
    })

  channels[channelName] = channel
}

export function leaveRoomChannel(roomOwnerId) {
  const channelName = `room:${roomOwnerId}`
  const channel = channels[channelName]
  if (!channel) return
  supabase.removeChannel(channel)
  delete channels[channelName]
}

export function broadcastPoop(roomOwnerId, depositorId) {
  const channel = channels[`room:${roomOwnerId}`]
  if (!channel) return
  channel.send({
    type:    'broadcast',
    event:   'poop',
    payload: { depositorId },
  })
}

export function broadcastClean(roomOwnerId) {
  const channel = channels[`room:${roomOwnerId}`]
  if (!channel) return
  channel.send({
    type:    'broadcast',
    event:   'clean',
    payload: {},
  })
}

export function broadcastKick(roomOwnerId, targetId) {
  const channel = channels[`room:${roomOwnerId}`]
  if (!channel) return
  channel.send({
    type:    'broadcast',
    event:   'kick',
    payload: { targetId },
  })
}
