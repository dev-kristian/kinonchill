import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, addMonths, subMonths, isSameDay, parseISO, isBefore, startOfDay } from 'date-fns';
import { DatePopularity, DateTimeSelection } from '@/types/types'; 

interface MovieNightCalendarProps {
  selectedDates: DateTimeSelection[];
  onDatesSelected: (dates: DateTimeSelection[]) => void;
  datePopularity?: DatePopularity[];
  activeUsername?: string;  
  userDates?: { [username: string]: { date: string; hours: string[] | 'all' }[] }; 
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function MovieNightCalendar({ 
  selectedDates, 
  onDatesSelected, 
  datePopularity = [],
  activeUsername,
  userDates = {}
}: MovieNightCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showHourPicker, setShowHourPicker] = useState(false);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateClick = useCallback((day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    
    const existingSelection = selectedDates.find(d => isSameDay(new Date(d.date), newDate));
    let newSelectedDates: DateTimeSelection[];

    if (existingSelection) {
      newSelectedDates = selectedDates.filter(d => !isSameDay(new Date(d.date), newDate));
    } else {
      newSelectedDates = [...selectedDates, { date: newDate, hours: 'all' }];
    }

    onDatesSelected(newSelectedDates);
  }, [currentDate, selectedDates, onDatesSelected]);

  const handleHourClick = useCallback((hour: number) => {
    if (!selectedDate) return;
  
    const existingSelection = selectedDates.find(d => isSameDay(new Date(d.date), selectedDate));
    let newSelectedDates: DateTimeSelection[];
  
    if (existingSelection) {
      if (existingSelection.hours === 'all') {
        newSelectedDates = selectedDates.map(d => 
          isSameDay(new Date(d.date), selectedDate) 
            ? { ...d, hours: [hour] } 
            : d
        );
      } else if (Array.isArray(existingSelection.hours)) {
        if (existingSelection.hours.includes(hour)) {
          const newHours = existingSelection.hours.filter(h => h !== hour);
          if (newHours.length === 0) {
            newSelectedDates = selectedDates.filter(d => !isSameDay(new Date(d.date), selectedDate));
          } else {
            newSelectedDates = selectedDates.map(d => 
              isSameDay(new Date(d.date), selectedDate) 
                ? { ...d, hours: newHours } 
                : d
            );
          }
        } else {
          newSelectedDates = selectedDates.map(d => 
            isSameDay(new Date(d.date), selectedDate) 
              ? { ...d, hours: [...d.hours as number[], hour] } 
              : d
          );
        }
      } else {
        newSelectedDates = [...selectedDates];
      }
    } else {
      newSelectedDates = [...selectedDates, { date: selectedDate, hours: [hour] }];
    }
  
    onDatesSelected(newSelectedDates);
  }, [selectedDate, selectedDates, onDatesSelected]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1));
  }, []);

  const renderCalendar = useCallback(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = startOfDay(new Date());

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8 sm:w-10 sm:h-10"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isPastDate = isBefore(date, today);
      const popularity = datePopularity.find(d => isSameDay(parseISO(d.date), date));
      const isActiveUserSelected = selectedDates.some(d => isSameDay(new Date(d.date), date));
      
      const otherUsersSelected = Object.entries(userDates).filter(([username, dates]) => 
        username !== activeUsername && dates.some(d => isSameDay(new Date(d.date), date))
      );

      const totalUsersSelected = otherUsersSelected.length + (isActiveUserSelected ? 1 : 0);

      let className = 'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative text-sm sm:text-base transition-all duration-200 ';
      if (isPastDate) {
        className += 'bg-gray-700 text-gray-500 cursor-not-allowed';
      } else if (isActiveUserSelected) {
        className += 'bg-primary/70 text-white font-bold';
      } else if (otherUsersSelected.length > 0) {
        className += 'border-2 border-pink-500 text-pink-500 font-semibold';
      } else {
        className += `hover:bg-pink-400 hover:text-white ${popularity ? `bg-pink-${Math.min(popularity.count * 100, 900)}` : 'bg-gray-800'} ${popularity && popularity.count > 5 ? 'text-white' : 'text-gray-300'}`;
      }
      
      days.push(
        <button
          key={i}
          onClick={() => !isPastDate && handleDateClick(i)}
          className={className}
          title={popularity ? `Selected by: ${popularity.users.join(', ')}` : ''}
          disabled={isPastDate}
        >
          {i}
          {totalUsersSelected > 0 && !isPastDate && (
            <span className="absolute top-0 right-0 text-xs bg-red-700 text-white rounded-full w-3 h-4 flex items-center justify-center">
              {totalUsersSelected}
            </span>
          )}
        </button>
      );
    }

    return days;
  }, [currentDate, datePopularity, selectedDates, userDates, activeUsername, handleDateClick]);

  const renderHours = useCallback(() => {
    if (!selectedDate) return null;
  
    const selectedDateTimes = selectedDates.find(d => isSameDay(new Date(d.date), selectedDate));
    const popularityForDate = datePopularity.find(d => isSameDay(parseISO(d.date), selectedDate));
  
    return (
      <div className="grid grid-cols-6 gap-1">
        {HOURS.map(hour => {
          const hourPopularity = popularityForDate?.hours[hour];
          const isActiveUserSelected = selectedDateTimes?.hours === 'all' || 
            (Array.isArray(selectedDateTimes?.hours) && selectedDateTimes?.hours.includes(hour));
  
          const otherUsersSelected = Object.entries(userDates).filter(([username, dates]) => 
            username !== activeUsername && 
            dates.some(d => isSameDay(new Date(d.date), selectedDate) && 
              (d.hours === 'all' || (Array.isArray(d.hours) && d.hours.includes(hour.toString())))
            )
          );
  
          const totalUsersSelected = otherUsersSelected.length + (isActiveUserSelected ? 1 : 0);
  
          let className = 'w-10 h-10 rounded-full flex items-center justify-center relative ';
          if (isActiveUserSelected) {
            className += 'bg-primary/70 text-white';
          } else if (otherUsersSelected.length > 0) {
            className += 'border-2 border-pink-500/70 text-white';
          } else {
            className += `hover:bg-pink-400/50 ${hourPopularity ? `bg-pink-${Math.min(hourPopularity.count * 100, 900)}` : ''} ${hourPopularity && hourPopularity.count > 5 ? 'text-white' : 'text-white'}`;
          }
  
          return (
            <button
              key={hour}
              onClick={() => handleHourClick(hour)}
              className={className}
              title={hourPopularity ? `Selected by: ${hourPopularity.users.join(', ')}` : ''}
            >
              {hour.toString().padStart(2, '0')}
              {totalUsersSelected > 0 && (
                <span className="absolute top-0 right-0 text-xs bg-red-700 text-white rounded-full w-3 h-4 flex items-center justify-center">
                  {totalUsersSelected}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }, [selectedDate, selectedDates, datePopularity, userDates, activeUsername, handleHourClick]);

  return (
    <div className="mt-2 flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
      <div className="bg-gray-900/50 p-2 md:p-4 rounded-lg shadow-lg flex-grow">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={handlePrevMonth} variant="ghost" className="text-pink-500 hover:bg-pink-500 hover:text-white"><ChevronLeft /></Button>
          <h3 className="text-lg font-semibold text-white">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <Button onClick={handleNextMonth} variant="ghost" className="text-pink-500 hover:bg-pink-500 hover:text-white"><ChevronRight /></Button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {DAYS.map(day => (
            <div key={day} className="text-center font-medium text-pink-500 text-sm">{day}</div>
          ))}
          {renderCalendar()}
        </div>
        {selectedDate && (
          <Button 
            onClick={() => setShowHourPicker(!showHourPicker)} 
            className="mt-4 bg-transparent hover:bg-transparent text-white hover:text-primary/70 shadow-none w-full transition-all duration-200"
          >
            <Clock className="mr-2 h-4 w-4 text-primary/70" />
            {showHourPicker ? 'Hide' : 'Show'} Hour Picker
          </Button>
        )}
      </div>
      {selectedDate && showHourPicker && (
        <div className="bg-gray-900/50 p-4 rounded-lg shadow-lg flex-grow lg:flex-grow-0">
          <h3 className="text-lg font-semibold mb-4 text-white">Hours for {format(selectedDate, 'PPP')}</h3>
          {renderHours()}
        </div>
      )}
    </div>
  );
}