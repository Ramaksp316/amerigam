import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PersonalOnboarding from './PersonalOnboarding'
import BusinessOnboarding from './BusinessOnboarding'
import CreatorOnboarding from './CreatorOnboarding'
import InfluencerOnboarding from './InfluencerOnboarding'
import OrgOnboarding from './OrgOnboarding'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) redirect('/signin')

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) redirect('/signin')
  if (user.onboarded) redirect('/home')

  const initialData = {
    name: user.name || '',
    email: user.email,
    username: user.username || '',
  }

  switch (user.accountType) {
    case 'BUSINESS':
      return <BusinessOnboarding initialData={initialData} />
    case 'CREATOR':
      return <CreatorOnboarding initialData={initialData} />
    case 'INFLUENCER':
      return <InfluencerOnboarding initialData={initialData} />
    case 'ORGANIZATION':
      return <OrgOnboarding initialData={initialData} />
    default:
      return <PersonalOnboarding initialData={initialData} />
  }
}
