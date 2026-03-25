import React from 'react'
import { PublicFooter } from '../../shared/components/PublicFooter'

export const PublicLayout = () => {
  return (
     <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
