// tests/db.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

// We mock @supabase/supabase-js so tests don't need a real Supabase connection
const mockSingle = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    })),
  })),
}))

// Import after mock is set up
const { createUser, fetchPoopsInHouse, cleanPoop } = await import('../src/db.js')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createUser', () => {
  it('inserts with correct column names (snake_case)', async () => {
    const fakeUser = { id: 'u1', nickname: 'taro' }
    const selectMock = vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: fakeUser, error: null }) }))
    mockInsert.mockReturnValue({ select: selectMock })

    const result = await createUser({ nickname: 'taro', characterType: 'cat', frameColor: 'pink', roomStyle: 'oneroom' })

    expect(mockInsert).toHaveBeenCalledWith({
      nickname: 'taro',
      character_type: 'cat',
      frame_color: 'pink',
      room_style: 'oneroom',
    })
    expect(result.id).toBe('u1')
  })
})

describe('fetchPoopsInHouse', () => {
  it('filters by house_owner_id and is_cleaned=false', async () => {
    const eqIsCleanedMock = vi.fn().mockResolvedValue({ data: [], error: null })
    const eqOwnerMock = vi.fn(() => ({ eq: eqIsCleanedMock }))
    mockSelect.mockReturnValue({ eq: eqOwnerMock })

    await fetchPoopsInHouse('owner-123')

    expect(mockSelect).toHaveBeenCalledWith('*, depositor:depositor_id(nickname, character_type)')
    expect(eqOwnerMock).toHaveBeenCalledWith('house_owner_id', 'owner-123')
    expect(eqIsCleanedMock).toHaveBeenCalledWith('is_cleaned', false)
  })
})

describe('cleanPoop', () => {
  it('sets is_cleaned=true for the given poop id', async () => {
    const eqMock = vi.fn().mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: eqMock })

    await cleanPoop('poop-abc')

    expect(mockUpdate).toHaveBeenCalledWith({ is_cleaned: true })
    expect(eqMock).toHaveBeenCalledWith('id', 'poop-abc')
  })
})
