'use client'

import { useState } from 'react'

export default function NetworkSection() {
  const [activeTab, setActiveTab] = useState('builders')

  const builders = [
    {
      name: 'René Hdz',
      role: 'Mod at @OctantApp',
      image: '/images/avatars/avatar-1.jpg',
      specialty: 'Web3 & DeFi',
    },
    {
      name: 'René Hdz',
      role: 'Mod at @OctantApp',
      image: '/images/avatars/avatar-2.jpg',
      specialty: 'Blockchain',
    },
    {
      name: 'René Hdz',
      role: 'Mod at @OctantApp',
      image: '/images/avatars/avatar-3.jpg',
      specialty: 'Smart Contracts',
    },
  ]

  const communities = [
    { name: 'Y Combinator', members: '2K+', color: 'orange' },
    { name: 'Techstars', members: '1.5K+', color: 'blue' },
    { name: '500 Startups', members: '800+', color: 'green' },
    { name: 'Founders Inc', members: '600+', color: 'pink' },
  ]

  const partnerships = [
    { name: 'Google for Startups', type: 'Tech Partner', logo: '🟢' },
    { name: 'AWS Activate', type: 'Cloud Partner', logo: '🟠' },
    { name: 'Microsoft for Startups', type: 'Tech Partner', logo: '🔵' },
    { name: 'Stripe Atlas', type: 'Fintech Partner', logo: '🟣' },
  ]

  const tabs = [
    { id: 'builders', label: 'Builders destacados', color: 'bg-secondary' },
    { id: 'communities', label: 'Comunidades aliadas', color: 'bg-accent' },
    {
      id: 'partnerships',
      label: 'Partnerships estratégicos',
      color: 'bg-primary',
    },
  ]

  return (
    <section className="page py-12">
      <div className="page-content gap-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Nuestra <span className="text-primary">red</span> te abre puertas
          </h2>
          <p className="text-xl text-muted">
            Conectamos talento excepcional con oportunidades únicas
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-12 flex flex-wrap justify-center gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-6 py-3 font-medium transition-all duration-200 ${activeTab === tab.id
                  ? `${tab.color} text-white shadow-lg`
                  : 'bg-white text-foreground hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mx-auto max-w-6xl">
          {activeTab === 'builders' && (
            <div className="rounded-3xl bg-foreground p-8 md:p-12">
              <div className="mb-8 text-center">
                <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl">
                  Builders destacados
                </h3>
                <p className="text-white/70">
                  200+ builders activos, representando 15+ países
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {builders.map((builder, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-white p-6 text-center"
                  >
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
                        <span className="text-2xl">👤</span>
                      </div>
                    </div>
                    <h4 className="mb-1 text-xl font-bold text-foreground">
                      {builder.name}
                    </h4>
                    <p className="mb-3 text-sm text-muted">{builder.role}</p>
                    <div className="rounded-lg bg-primary/10 p-2">
                      <p className="text-sm font-medium text-primary">
                        {builder.specialty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'communities' && (
            <div className="grid gap-6 md:grid-cols-2">
              {communities.map((community, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 rounded-2xl bg-white p-8"
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${community.color === 'orange'
                        ? 'bg-primary'
                        : community.color === 'blue'
                          ? 'bg-blue-500'
                          : community.color === 'green'
                            ? 'bg-accent'
                            : 'bg-secondary'
                      }`}
                  >
                    <span className="text-xl font-bold text-white">
                      {community.name[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground">
                      {community.name}
                    </h4>
                    <p className="text-muted">
                      {community.members} miembros conectados
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'partnerships' && (
            <div className="grid gap-6 md:grid-cols-2">
              {partnerships.map((partnership, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 rounded-2xl bg-white p-8"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <span className="text-2xl">{partnership.logo}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground">
                      {partnership.name}
                    </h4>
                    <p className="text-muted">{partnership.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
