import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '../../../lib/prisma';
import TestAccountSelector from './TestAccountSelector';

export const dynamic = 'force-dynamic'; // Always fetch fresh test accounts

export default async function TestAccountsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (userId) {
    // If somehow already logged in, redirect to feed. But since this is a testing tool, 
    // we might want to allow them to switch? Let's just render the selector anyway if they 
    // explicitly navigate here. 
  }

  const users = await prisma.user.findMany({
    include: {
      outgoingConnections: {
        include: {
          target: {
            select: { name: true, username: true }
          }
        }
      }
    },
    orderBy: [
      { accountType: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  const accounts = users.map(user => {
    let roleContext = null;
    
    // Attempt to format a readable role context (e.g. "Founder at NovaNest AI")
    if (user.outgoingConnections && user.outgoingConnections.length > 0) {
      // Pick the primary/first connection
      const conn = user.outgoingConnections[0];
      const targetName = conn.target.name || conn.target.username;
      
      // Clean up enum/uppercase roles like "FOUNDER" to "Founder"
      const formattedRole = conn.role
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      roleContext = `${formattedRole} at ${targetName}`;
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      accountType: user.accountType,
      avatarData: user.avatarData,
      roleContext
    };
  });

  return (
    <TestAccountSelector accounts={accounts} />
  );
}
