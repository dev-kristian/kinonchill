import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, Timestamp } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const sessionsRef = collection(db, 'sessions');
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const q = query(
        sessionsRef,
        where('status', '==', 'active'),
        where('createdAt', '<', Timestamp.fromDate(twentyFourHoursAgo))
      );

      const querySnapshot = await getDocs(q);

      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { status: 'inactive' })
      );

      await Promise.all(updatePromises);

      res.status(200).json({ message: `Updated ${updatePromises.length} sessions to inactive` });
    } catch (error) {
      console.error('Error updating session status:', error);
      res.status(500).json({ error: 'Failed to update session status' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}