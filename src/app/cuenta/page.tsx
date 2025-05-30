import PageWithAppbar from '@/components/layout/page-wrapper'
import { ConnectedAccount } from '@/components/onchain/connected-account'
import React from 'react'

export default function Account() {
  return (
    <PageWithAppbar>
      <div className="page container">
        <div className="mb-4">
          <h2>cuenta</h2>
        </div>
        <div className="section">
          <ConnectedAccount />
        </div>
      </div>
    </PageWithAppbar>
  )
}
