import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 

interface DateTimeSelection {
  date: Date;
  hours: number[];
} 

interface MovieNightCalendarProps {
  selectedDates: DateTimeSelection[];
  onDatesSelected: (dates: DateTimeSelection[]) => void;
} 

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const HOURS = Array.from({ length: 24 }, (_, i) => i); 

export default function MovieNightCalendar({ selectedDates, onDatesSelected }: MovieNightCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); 

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }; 

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }; 

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  }; 

  const handleHourClick = (hour: number) => {
    if (!selectedDate) return; 
const existingSelection = selectedDates.find(d => d.date.toDateString() === selectedDate.toDateString());
let newSelectedDates: DateTimeSelection[];

if (existingSelection) {
  if (existingSelection.hours.includes(hour)) {
    existingSelection.hours = existingSelection.hours.filter(h => h !== hour);
    if (existingSelection.hours.length === 0) {
      newSelectedDates = selectedDates.filter(d => d.date.toDateString() !== selectedDate.toDateString());
    } else {
      newSelectedDates = [...selectedDates];
    }
  } else {
    existingSelection.hours.push(hour);
    newSelectedDates = [...selectedDates];
  }
} else {
  newSelectedDates = [...selectedDates, { date: selectedDate, hours: [hour] }];
}

onDatesSelected(newSelectedDates);

  }; 

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }; 

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }; 

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = []; 
for (let i = 0; i < firstDayOfMonth; i++) {
  days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
}

for (let i = 1; i <= daysInMonth; i++) {
  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
  const isSelected = selectedDates.some(d => d.date.toDateString() === date.toDateString());
  days.push(
    <button
      key={i}
      onClick={() => handleDateClick(i)}
      className={`w-10 h-10 rounded-full ${isSelected ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
    >
      {i}
    </button>
  );
}

return days;

  }; 

  const renderHours = () => {
    if (!selectedDate) return null; 
const selectedDateTimes = selectedDates.find(d => d.date.toDateString() === selectedDate.toDateString());

return (
  <div className="grid grid-cols-6 gap-1">
    {HOURS.map(hour => (
      <button
        key={hour}
        onClick={() => handleHourClick(hour)}
        className={`w-10 h-10 rounded-full ${selectedDateTimes?.hours.includes(hour) ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
      >
        {hour.toString().padStart(2, '0')}
      </button>
    ))}
  </div>
);

  }; 

  return (
    <div className="mt-4 flex space-x-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <Button onClick={handlePrevMonth} variant="ghost"><ChevronLeft /></Button>
          <h3 className="text-lg font-semibold">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <Button onClick={handleNextMonth} variant="ghost"><ChevronRight /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {DAYS.map(day => (
            <div key={day} className="text-center font-medium">{day}</div>
          ))}
          {renderCalendar()}
        </div>
      </div>
      {selectedDate && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Hours for {selectedDate.toDateString()}</h3>
          {renderHours()}
        </div>
      )}
    </div>
  );
} 