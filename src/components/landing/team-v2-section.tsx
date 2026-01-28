import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

export default function TeamV2Section() {
  const team = [
    { name: 'MEL', role: 'Founder & CEO', subrole: 'DevRel Lead', initials: 'M', image: '', bgColor: 'bg-primary' },
    { name: 'K7', role: 'CPO', subrole: 'Product', initials: 'K', image: '', bgColor: 'bg-muted' },
    { name: 'VALENTÍN', role: 'COO', subrole: 'Operations', initials: 'V', image: '', bgColor: 'bg-accent' },
    { name: 'BRIAN', role: 'DevRel Lead', subrole: 'Community', initials: 'B', image: '', bgColor: 'bg-secondary' },
    { name: 'SCARF', role: 'Technical Lead', subrole: 'Engineering', initials: 'S', image: '', bgColor: 'bg-muted' },
    { name: 'IAN', role: 'Business Dev', subrole: 'Partnerships', initials: 'I', image: '', bgColor: 'bg-primary' },
  ]

  return (
    <section id="team-section" className="page bg-muted py-20 md:py-28">
      <div className="page-content">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Headline */}
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-black text-background md:text-4xl lg:text-5xl">
              Quiénes te van a{' '}
              <span className="inline-block rotate-1 transform rounded-lg bg-accent px-4 py-2 text-foreground shadow-lg">
                guiar
              </span>
            </h2>
            <p className="text-lg font-bold text-background/80 md:text-xl">
              Mentores que ya lo hicieron. No instructores —{' '}
              <span className="text-primary">practitioners.</span>
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-background shadow-lg transition-all hover:scale-105"
              >
                <div className={`absolute inset-0 ${member.bgColor} opacity-10`}></div>
                <div className="relative flex flex-col items-center space-y-4 p-8 text-center">
                  <Avatar className="h-24 w-24 border-2 border-border shadow-lg">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback className={`${member.bgColor} text-xl font-black ${member.bgColor === 'bg-muted' ? 'text-background' : 'text-white'}`}>
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-foreground">{member.name}</h3>
                    <p className="text-base font-bold text-secondary">{member.role}</p>
                    <p className="text-sm font-medium text-foreground/60">{member.subrole}</p>
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${member.bgColor}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
