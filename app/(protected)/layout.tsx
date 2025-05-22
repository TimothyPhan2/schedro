import { getAuthenticatedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 // Check for the authenticated user on the server side
 const { user } = await getAuthenticatedUser();

 // If no user is found, redirect to the login page on the server
 // The middleware would have already handled the initial redirect for unauthenticated access,
 // but this provides an additional layer of protection within the layout itself.
 if (!user) {
   // Note: Server-side redirect doesn't typically need the 'redirect' query param
   // unless your login page explicitly expects it for server-side redirects.
   // For now, a simple redirect to /login is standard.
   redirect('/login'); 
 }

 // If user is authenticated, render children
 return <>{children}</>;

} 