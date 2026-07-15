import * as React from 'react'
import { getMyProfile, type ResidentProfile } from '#/lib/api/resident'

type ProfileStatus = 'loading' | 'ready' | 'error'

interface MemberProfileContextValue {
  profile: ResidentProfile | null
  status: ProfileStatus
  setProfile: (profile: ResidentProfile) => void
  reload: () => void
}

const MemberProfileContext = React.createContext<MemberProfileContextValue | null>(null)

export function MemberProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = React.useState<ResidentProfile | null>(null)
  const [status, setStatus] = React.useState<ProfileStatus>('loading')

  const load = React.useCallback(() => {
    let active = true
    setStatus('loading')
    getMyProfile()
      .then((data) => {
        if (!active) return
        setProfile(data)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [])

  React.useEffect(() => load(), [load])

  const value = React.useMemo<MemberProfileContextValue>(
    () => ({ profile, status, setProfile, reload: load }),
    [profile, status, load],
  )

  return <MemberProfileContext.Provider value={value}>{children}</MemberProfileContext.Provider>
}

export function useMyProfile(): MemberProfileContextValue {
  const ctx = React.useContext(MemberProfileContext)
  if (!ctx) throw new Error('useMyProfile must be used within MemberProfileProvider')
  return ctx
}
