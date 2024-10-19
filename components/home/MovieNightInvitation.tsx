import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { useUserData } from '@/context/UserDataContext';
import { useSession } from '@/context/SessionContext';
import MovieNightCalendar from './MovieNightCalendar'; 

interface DateTimeSelection {
  date: Date;
  hours: number[];
} 

export default function MovieNightInvitation() {
  const { toast } = useToast();
  const { userData, isLoading: userLoading } = useUserData();
  const { createSession } = useSession();
  const [selectedDates, setSelectedDates] = useState<DateTimeSelection[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [sendNotification, setSendNotification] = useState(false); 

  const handleCreateSession = () => {
    setShowCalendar(true);
  }; 

  const handleDatesSelected = (dates: DateTimeSelection[]) => {
    setSelectedDates(dates);
  }; 

  const completeSession = async () => {
    if (userLoading || !userData) {
      toast({
        title: "Error",
        description: "User data not available. Please try again.",
        variant: "destructive",
      });
      return;
    } 
try {
  // Convert DateTimeSelection[] to Date[]
  const formattedDates = selectedDates.flatMap(({ date, hours }) => 
    hours.map(hour => {
      const dateTime = new Date(date);
      dateTime.setHours(hour);
      return dateTime;
    })
  );

  // Create the session in the database with selected dates
  await createSession(formattedDates);

  // Send notification if checkbox is checked
  if (sendNotification) {
    await sendInvitation();
  }

  toast({
    title: "Session Created",
    description: "Your movie night session has been created successfully!",
  });

  // Reset the component state
  setShowCalendar(false);
  setSelectedDates([]);
  setSendNotification(false);
} catch (error) {
  console.error('Error completing session:', error);
  toast({
    title: "Error",
    description: "Failed to complete the session. Please try again.",
    variant: "destructive",
  });
}

  }; 

  const sendInvitation = async () => {
    if (!userData) {
      throw new Error("User data is not available");
    } 
try {
  const response = await fetch('/api/send-notification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `${userData.username} invites you!`,
      body: `${userData.username} invites you to a movie night!`,
      icon: '/icon-192x192.png',
      clickAction: 'https://localhost:3000/',
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to send invitation');
  }
} catch (error) {
  console.error('Error sending invitation:', error);
  throw error;
}

  }; 

  return (
    <div className="bg-secondary p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Host a Movie Night</h2>
      {!showCalendar ? (
        <Button onClick={handleCreateSession}>Create Movie Night Session</Button>
      ) : (
        <div>
          <MovieNightCalendar 
            selectedDates={selectedDates} 
            onDatesSelected={handleDatesSelected} 
          />
          <div className="mt-4 flex items-center">
            <Checkbox
              id="sendNotification"
              checked={sendNotification}
              onCheckedChange={(checked) => setSendNotification(checked as boolean)}
            />
            <label htmlFor="sendNotification" className="ml-2">
              Send notification to all users
            </label>
          </div>
          <Button onClick={completeSession} className="mt-4">Complete Session</Button>
        </div>
      )}
    </div>
  );
} 