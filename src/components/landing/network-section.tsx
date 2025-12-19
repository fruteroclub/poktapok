'use client'

import { useState } from 'react'

export default function NetworkSection() {
  const [activeTab, setActiveTab] = useState('builders')

  const builders = [
    {
      name: "René Hdz",
      role: "Mod at @OctantApp",
      image: "/images/avatars/avatar-1.jpg",
      specialty: "Web3 & DeFi"
    },
    {
      name: "René Hdz",
      role: "Mod at @OctantApp",
      image: "/images/avatars/avatar-2.jpg",
      specialty: "Blockchain"
    },
    {
      name: "René Hdz",
      role: "Mod at @OctantApp",
      image: "/images/avatars/avatar-3.jpg",
      specialty: "Smart Contracts"
    }
  ]

  const communities = [
    { name: "Y Combinator", members: "2K+", color: "orange" },
    { name: "Techstars", members: "1.5K+", color: "blue" },
    { name: "500 Startups", members: "800+", color: "green" },
    { name: "Founders Inc", members: "600+", color: "pink" }
  ]

  const partnerships = [
    { name: "Google for Startups", type: "Tech Partner", logo: "🟢" },
    { name: "AWS Activate", type: "Cloud Partner", logo: "🟠" },
    { name: "Microsoft for Startups", type: "Tech Partner", logo: "🔵" },
    { name: "Stripe Atlas", type: "Fintech Partner", logo: "🟣" }
  ]

  const tabs = [
    { id: 'builders', label: 'Builders destacados', color: 'bg-secondary' },
    { id: 'communities', label: 'Comunidades aliadas', color: 'bg-accent' },
    { id: 'partnerships', label: 'Partnerships estratégicos', color: 'bg-primary' }
  ]

  return (
    <section className="page py-12">
      <div className="container gap-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Nuestra <span className="text-primary">red</span> te abre puertas
          </h2>
          <p className="text-xl text-muted">
            Conectamos talento excepcional con oportunidades únicas
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${activeTab === tab.id
                ? `${tab.color} text-white shadow-lg`
                : 'bg-white text-foreground hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'builders' && (
            <div className="bg-foreground rounded-3xl p-8 md:p-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Builders destacados
                </h3>
                <p className="text-white/70">
                  200+ builders activos, representando 15+ países
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {builders.map((builder, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-1">
                      {builder.name}
                    </h4>
                    <p className="text-muted text-sm mb-3">
                      {builder.role}
                    </p>
                    <div className="bg-primary/10 rounded-lg p-2">
                      <p className="text-primary font-medium text-sm">
                        {builder.specialty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'communities' && (
            <div className="grid md:grid-cols-2 gap-6">
              {communities.map((community, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${community.color === 'orange' ? 'bg-primary' :
                    community.color === 'blue' ? 'bg-blue-500' :
                      community.color === 'green' ? 'bg-accent' :
                        'bg-secondary'
                    }`}>
                    <span className="text-white font-bold text-xl">
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
            <div className="grid md:grid-cols-2 gap-6">
              {partnerships.map((partnership, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl">{partnership.logo}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground">
                      {partnership.name}
                    </h4>
                    <p className="text-muted">
                      {partnership.type}
                    </p>
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