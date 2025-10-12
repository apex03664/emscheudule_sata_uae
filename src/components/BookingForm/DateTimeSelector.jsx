import React, { useMemo } from "react";
import { format } from "date-fns";

const DateTimeSelector = ({
  timezone,
  setTimezone,
  timeFormat,
  setTimeFormat,
  currentMonth,
  setCurrentMonth,
  currentYear,
  setCurrentYear,
  currentMonthDays,
  today,
  dateSlotMap,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  timeSlots,
  setShowForm,
  getTimezoneOffset,
  convertTimeToTimezone,
}) => {
  const localToday = new Date();
  localToday.setHours(0, 0, 0, 0);

  const timezoneOptions = [
    // Middle East Timezones
    { value: "Asia/Dubai", label: "🇦🇪 UAE", name: "Dubai" },
    { value: "Asia/Riyadh", label: "🇸🇦 Saudi Arabia", name: "Riyadh" },
    { value: "Asia/Kuwait", label: "🇰🇼 Kuwait", name: "Kuwait" },
    { value: "Asia/Qatar", label: "🇶🇦 Qatar", name: "Doha" },
    { value: "Asia/Bahrain", label: "🇧🇭 Bahrain", name: "Manama" },
    { value: "Asia/Muscat", label: "🇴🇲 Oman", name: "Muscat" },
    { value: "Asia/Tehran", label: "🇮🇷 Iran", name: "Tehran" },
    { value: "Asia/Baghdad", label: "🇮🇶 Iraq", name: "Baghdad" },
    { value: "Asia/Jerusalem", label: "🇮🇱 Israel", name: "Jerusalem" },
    { value: "Asia/Amman", label: "🇯🇴 Jordan", name: "Amman" },
    { value: "Asia/Beirut", label: "🇱🇧 Lebanon", name: "Beirut" },
    { value: "Asia/Damascus", label: "🇸🇾 Syria", name: "Damascus" },
    { value: "Asia/Istanbul", label: "🇹🇷 Turkey", name: "Istanbul" },

    // South Asia
    { value: "Asia/Kolkata", label: "🇮🇳 India", name: "Kolkata" },
     { value: "Asia/Dhaka", label: "🇧🇩 Bangladesh", name: "Dhaka" },
    { value: "Asia/Colombo", label: "🇱🇰 Sri Lanka", name: "Colombo" },
    { value: "Asia/Kathmandu", label: "🇳🇵 Nepal", name: "Kathmandu" },
    { value: "Asia/Thimphu", label: "🇧🇹 Bhutan", name: "Thimphu" },
    { value: "Asia/Rangoon", label: "🇲🇲 Myanmar", name: "Yangon" },
 
    // Central Asia
    { value: "Asia/Tashkent", label: "🇺🇿 Uzbekistan", name: "Tashkent" },
  

    // Popular International (for reference)
     { value: "Europe/London", label: "🇬🇧 London", name: "London" },
     { value: "Africa/Cairo", label: "🇪🇬 E  gypt", name: "Cairo" }
  ];

  // Get current timezone info
  const currentTimezoneInfo = timezoneOptions.find(tz => tz.value === timezone);
  const timezoneOffset = getTimezoneOffset(timezone);

  // Function to convert IST time to user's selected timezone
  const convertISTToUserTimezone = (istTimeString) => {
    try {
      if (!istTimeString || !istTimeString.includes('-')) {
        return istTimeString;
      }

      const [startTime, endTime] = istTimeString.split('-').map(t => t.trim());
      
      const convertSingleTime = (timeStr) => {
        // Parse IST time
        const [time, meridian] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        // Convert to 24-hour format
        if (meridian === 'PM' && hours !== 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;
        
        // Create date object in IST
        const today = new Date();
        const istDate = new Date();
        istDate.setHours(hours, minutes, 0, 0);
        
        // Get IST time as base
        const istTime = istDate.toLocaleString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Convert to user's timezone
        const userTime = istDate.toLocaleString('en-US', {
          timeZone: timezone,
          hour12: timeFormat === '12h',
          hour: timeFormat === '12h' ? 'numeric' : '2-digit',
          minute: '2-digit'
        });
        
        return userTime;
      };

      const convertedStart = convertSingleTime(startTime);
      const convertedEnd = convertSingleTime(endTime);
      
      return `${convertedStart}-${convertedEnd}`;
    } catch (error) {
      console.error('Error converting time:', error);
      return istTimeString; // Return original if conversion fails
    }
  };

  // Convert time slots to user's timezone
  const convertedTimeSlots = useMemo(() => {
    if (!selectedDate || !dateSlotMap[format(selectedDate, "yyyy-MM-dd")]) {
      return [];
    }

    const slots = dateSlotMap[format(selectedDate, "yyyy-MM-dd")];
    const uniqueTimes = [...new Set(slots.map((s) => s.time))];
    
    return uniqueTimes.map(istTime => {
      const convertedTime = convertISTToUserTimezone(istTime);
      return {
        originalTime: istTime, // Keep original IST time for backend
        displayTime: convertedTime, // Show converted time to user
        isValid: convertedTime !== istTime || timezone === 'Asia/Kolkata'
      };
    }).filter(slot => slot.isValid);
  }, [selectedDate, dateSlotMap, timezone, timeFormat]);

  // Handle timezone change with validation
  const handleTimezoneChange = (newTimezone) => {
    try {
      // Test if timezone is valid
      new Intl.DateTimeFormat('en-US', { timeZone: newTimezone });
      setTimezone(newTimezone);
      // Reset selected time when timezone changes
      setSelectedTime("");
    } catch (error) {
      console.error('Invalid timezone selected:', newTimezone, error);
      // Keep current timezone if invalid
    }
  };

  // Handle time selection
  const handleTimeSelection = (slot) => {
    if (selectedDate && slot) {
      // Store the original IST time for backend, but show converted time to user
      setSelectedTime(slot.originalTime); // This goes to backend
      setShowForm(true);
    }
  };

  // Get timezone abbreviation
  const getTimezoneAbbr = (tz) => {
    const abbreviations = {
      'Asia/Dubai': 'GST',
      'Asia/Riyadh': 'AST',
      'Asia/Kolkata': 'IST',
      'Asia/Kuwait': 'AST',
      'Asia/Qatar': 'AST',
      'Asia/Bahrain': 'AST',
      'Asia/Muscat': 'GST',
      'Asia/Tehran': 'IRST',
      'Asia/Baghdad': 'AST',
      'America/New_York': 'EST/EDT',
      'Europe/London': 'GMT/BST',
      'Asia/Singapore': 'SGT',
      'Asia/Tokyo': 'JST'
    };
    return abbreviations[tz] || tz.split('/')[1] || 'Local';
  };

  return (
    <div className="bg-black text-white rounded-3xl p-10 shadow-2xl datetime-container border border-gray-700 transition-all flex flex-col md:flex-row gap-14">
      {/* Side Panel */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <img
          src="https://img.flexifunnels.com/images/4337/i2njq_776_WhatsAppImage20230920at17.44.38.jpeg"
          alt="Logo"
          className="w-20 h-20 rounded-full"
        />
        <div>
          <h2 className="text-xl font-bold">Space Career Launch Pad- UPI PAID</h2>
          <p className="text-gray-400 text-sm mt-2">
            Set your Counselling appointment to be a part of SUPER1000 Jr Space Scientist Program.
            How your child can become a scientist, astronaut, or researcher in Space Science and Technology.
          </p>
        </div>
        <div className="bg-gray-800 px-3 py-1 rounded-full text-sm w-fit">1 hour</div>
      </div>

      {/* Calendar Section */}
      <div className="w-full md:w-1/3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <h3 className="text-sm md:text-base font-bold">Select a Date & Time</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            {/* Timezone Selector */}
            <select
              value={timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="w-full sm:w-auto min-w-[200px] bg-black border border-gray-700 px-3 py-2 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {timezoneOptions.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} {getTimezoneOffset(tz.value)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current timezone display */}
        <div className="mb-3 p-3 bg-gray-800 rounded-lg">
          <div className="text-xs text-gray-400">Your selected timezone:</div>
          <div className="text-sm font-semibold text-blue-400">
            {currentTimezoneInfo?.name || timezone} ({getTimezoneAbbr(timezone)}) {timezoneOffset}
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear((prev) => prev - 1);
              } else {
                setCurrentMonth((prev) => prev - 1);
              }
            }}
            className="text-xl px-3 py-1 rounded bg-gray-800 hover:bg-gray-700"
          >
            ←
          </button>
          <div className="text-lg font-semibold">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "long",
            })}{" "}
            {currentYear}
          </div>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear((prev) => prev + 1);
              } else {
                setCurrentMonth((prev) => prev + 1);
              }
            }}
            className="text-xl px-3 py-1 rounded bg-gray-800 hover:bg-gray-700"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-sm text-gray-400 font-semibold">
              {d}
            </div>
          ))}
          {currentMonthDays.map((day, index) => {
            if (day === null) return <div key={index} className="py-2" />;

            const formattedDate = format(day, "yyyy-MM-dd");
            const hasSlot = !!dateSlotMap[formattedDate];
            const isPast = day < localToday;

            const isSelected =
              selectedDate &&
              day.getDate() === selectedDate.getDate() &&
              day.getMonth() === selectedDate.getMonth() &&
              day.getFullYear() === selectedDate.getFullYear();

            const isClickable = hasSlot && !isPast;

            return (
              <button
                key={formattedDate}
                disabled={!isClickable}
                onClick={() => {
                  if (isClickable) {
                    setSelectedDate(day);
                    setSelectedTime(""); // Reset time when date changes
                  }
                }}
                className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200
                  ${isSelected
                    ? "bg-white text-black font-bold"
                    : isClickable
                      ? "bg-gray-800 text-white hover:bg-white hover:text-black border border-green-500"
                      : "bg-gray-900 text-gray-600 cursor-not-allowed opacity-50"
                  }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots Section */}
      <div className="w-full md:w-1/3">
        <div className="mb-4 text-base text-gray-400">
          Selected:{" "}
          <span className="text-white font-semibold">
            {selectedDate?.toLocaleDateString("en-GB")}
            {selectedTime && (
              <span className="ml-1 text-blue-400">
                at {convertISTToUserTimezone(selectedTime)}
              </span>
            )}
          </span>
        </div>

        {/* Time format toggle */}
        <div className="flex justify-between mb-3 text-xs">
          <button
            onClick={() => setTimeFormat('12h')}
            className={`px-3 py-1 rounded-full transition-all ${
              timeFormat === '12h' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            12h
          </button>
          <button
            onClick={() => setTimeFormat('24h')}
            className={`px-3 py-1 rounded-full transition-all ${
              timeFormat === '24h' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            24h
          </button>
        </div>

        <div className="space-y-2 flex items-center flex-col">
          {convertedTimeSlots && convertedTimeSlots.length > 0 ? (
            convertedTimeSlots.map((slot, index) => (
              <button
                key={`${slot.originalTime}-${index}`}
                onClick={() => handleTimeSelection(slot)}
                className={`py-3 w-full text-sm rounded-md border border-gray-700 transition-all flex justify-center items-center gap-2 hover:border-blue-500
                  ${selectedDate && slot
                    ? selectedTime === slot.originalTime
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-black text-white hover:bg-blue-700"
                    : "opacity-50 cursor-not-allowed"
                  }`}
              >
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                <div className="flex flex-col">
                  <span className="font-semibold">{slot.displayTime}</span>
                  {timezone !== 'Asia/Kolkata' && (
                    <span className="text-xs text-gray-400">
                      ({slot.originalTime} IST)
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="border border-red-600 text-red-500 px-4 py-6 rounded text-center text-sm">
              <p>No slots selected</p>
              <p className="text-xs mt-2 text-gray-400">
                Times will be shown in {getTimezoneAbbr(timezone)} timezone
              </p>
            </div>
          )}
        </div>

        {/* Timezone info footer */}
        {selectedDate && convertedTimeSlots.length > 0 && (
          <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-lg text-xs">
            <div className="flex items-center gap-2 text-blue-300">
              <span>🌍</span>
              <span>Times shown in your timezone: {getTimezoneAbbr(timezone)}</span>
            </div>
            {timezone !== 'Asia/Kolkata' && (
              <div className="text-gray-400 mt-1">
                Original IST times shown in parentheses
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimeSelector;
