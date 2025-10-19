import React, { useState } from "react";
import dayjs from "dayjs";
import TimezoneSelect from 'react-timezone-select';

const DateTimeSelector = ({
  timezone,
  setTimezone,
  dateSlotMap,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  timeSlots,
  setShowForm,
}) => {
  const [showAllDates, setShowAllDates] = useState(false);

  // ✅ Filter dates without timezone shift
  const availableDates = Object.keys(dateSlotMap)
    .sort()
    .filter(dateStr => {
      const date = dayjs(dateStr).startOf('day');
      const today = dayjs().startOf('day');
      return date.isAfter(today) || date.isSame(today);
    });

  const displayedDates = showAllDates ? availableDates : availableDates.slice(0, 8);
  
  // ✅ Format date without timezone shift
  const selectedDateStr = selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : null;

  // ✅ Get timezone display name
  const getTimezoneDisplayName = (tz) => {
    if (typeof tz === 'string') {
      const parts = tz.split('/');
      return parts[parts.length - 1].replace(/_/g, ' ');
    }
    // Handle timezone object from react-timezone-select
    if (tz && tz.label) {
      return tz.label;
    }
    return tz;
  };

  return (
    <div className="min-h-screen bg-[#0A1F1F] py-4 px-4 sm:py-8 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header - Green/Teal Theme */}
        <div className="bg-[#0F3A3A] rounded-2xl p-6 mb-6 border border-[#1A5252]">
          <div className="flex items-center gap-4 mb-4">
            <img
              src="https://img.flexifunnels.com/images/4337/i2njq_776_WhatsAppImage20230920at17.44.38.jpeg"
              alt="Logo"
              className="w-14 h-14 rounded-full border-2 border-[#14B8A6]"
            />
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Space Career Launch Pad - International
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Book your FREE counselling session (1st-9th Grade)
              </p>
            </div>
          </div>

          {/* ✅ React Timezone Select - All Timezones Included */}
          <div className="bg-[#0A1F1F] rounded-lg p-3 border border-[#1A5252]">
            <label className="block mb-2">
              <span className="text-xs text-gray-500">🌍 Your Timezone</span>
            </label>
            <TimezoneSelect
              value={timezone}
              onChange={(tz) => {
                // ✅ Handle both string and object return types
                const newTimezone = typeof tz === 'object' && tz.value ? tz.value : tz;
                console.log('🌍 Timezone changed to:', newTimezone);
                setTimezone(newTimezone);
                // Reset selections when timezone changes
                setSelectedDate(null);
                setSelectedTime("");
              }}
              // ✅ Custom styling for dark theme
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  backgroundColor: '#1A5252',
                  borderColor: state.isFocused ? '#14B8A6' : '#2D6A6A',
                  color: 'white',
                  boxShadow: state.isFocused ? '0 0 0 1px #14B8A6' : 'none',
                  '&:hover': {
                    borderColor: '#14B8A6',
                  },
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: '#0F3A3A',
                  border: '1px solid #1A5252',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused 
                    ? '#14B8A6' 
                    : state.isSelected 
                    ? '#0F766E' 
                    : '#0F3A3A',
                  color: 'white',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#14B8A6',
                  },
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                input: (provided) => ({
                  ...provided,
                  color: 'white',
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#9CA3AF',
                }),
              }}
            />
          </div>

          {/* ✅ Timezone info banner */}
          <div className="mt-3 p-2 bg-[#0A1F1F]/50 rounded-lg border border-[#1A5252]/50">
            <p className="text-xs text-gray-400 text-center">
              ⏰ All times are shown in <span className="text-[#14B8A6] font-medium">{getTimezoneDisplayName(timezone)}</span>
            </p>
          </div>
        </div>

        {availableDates.length === 0 ? (
          <div className="text-center py-16 bg-[#0F3A3A] rounded-2xl border border-[#1A5252]">
            <div className="text-5xl mb-3">📅</div>
            <p className="text-white font-semibold mb-1">No Slots Available</p>
            <p className="text-sm text-gray-400">Check back later</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Date Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  📅 Select a Date
                </h3>
                <span className="text-xs px-2 py-1 bg-[#1A5252] text-gray-400 rounded-full">
                  {availableDates.length} available
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {displayedDates.map((dateStr) => {
                  // ✅ Parse date without timezone shift
                  const date = dayjs(dateStr);
                  const isSelected = selectedDateStr === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => {
                        // ✅ Create local date object
                        const [year, month, day] = dateStr.split('-').map(Number);
                        setSelectedDate(new Date(year, month - 1, day));
                        setSelectedTime("");
                      }}
                      className={`p-3 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-[#14B8A6] border-[#14B8A6]"
                          : "bg-[#0F3A3A] border-[#1A5252] hover:border-[#14B8A6]/50"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-[10px] text-gray-400 mb-0.5 uppercase">
                          {date.format('MMM')}
                        </div>
                        <div className={`text-xl font-bold mb-0.5 ${isSelected ? "text-white" : "text-white"}`}>
                          {date.format('D')}
                        </div>
                        <div className={`text-[10px] ${isSelected ? "text-teal-200" : "text-gray-500"}`}>
                          {date.format('ddd')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {availableDates.length > 8 && (
                <button
                  onClick={() => setShowAllDates(!showAllDates)}
                  className="w-full mt-3 py-2 text-sm text-[#14B8A6] hover:text-white transition"
                >
                  {showAllDates ? "Show Less ↑" : `Show ${availableDates.length - 8} More ↓`}
                </button>
              )}
            </div>

            {/* Time Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  🕐 Select a Time
                </h3>
                {timeSlots.length > 0 && (
                  <span className="text-xs px-2 py-1 bg-[#1A5252] text-gray-400 rounded-full">
                    {timeSlots.length} slots
                  </span>
                )}
              </div>

              {!selectedDate ? (
                <div className="text-center py-12 bg-[#0F3A3A] rounded-xl border border-[#1A5252]">
                  <div className="text-4xl mb-2">👈</div>
                  <p className="text-sm text-gray-400">Select a date first</p>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-12 bg-[#0F3A3A] rounded-xl border border-[#1A5252]">
                  <div className="text-4xl mb-2">⏰</div>
                  <p className="text-sm text-gray-400">No slots available for this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`w-full p-4 rounded-xl border transition-all text-left ${
                          isSelected
                            ? "bg-[#14B8A6] border-[#14B8A6]"
                            : "bg-[#0F3A3A] border-[#1A5252] hover:border-[#14B8A6]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              isSelected ? "bg-white" : "bg-gray-600"
                            }`} />
                            <span className={`font-medium ${isSelected ? "text-white" : "text-white"}`}>
                              {slot}
                            </span>
                          </div>
                          {isSelected && <span className="text-white">✓</span>}
                        </div>
                      </button>
                    );
                  })}

                  {/* ✅ Confirmation section */}
                  {selectedTime && (
                    <div className="pt-4">
                      <div className="mb-4 p-4 bg-[#0F3A3A] rounded-xl border border-[#1A5252]">
                        <p className="text-xs text-gray-500 mb-1">Selected Session</p>
                        <p className="text-white font-medium">
                          {dayjs(selectedDate).format('D MMMM YYYY')}
                        </p>
                        <p className="text-[#14B8A6] font-semibold text-lg mt-1">{selectedTime}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          🌍 {getTimezoneDisplayName(timezone)}
                        </p>
                      </div>

                      <button
                        onClick={() => setShowForm(true)}
                        className="w-full py-4 bg-[#14B8A6] hover:bg-[#0F766E] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#14B8A6]/20"
                      >
                        Continue to Registration →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimeSelector;
