import React from "react";
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
  { value: "Asia/Karachi", label: "🇵🇰 Pakistan", name: "Karachi" },
  { value: "Asia/Dhaka", label: "🇧🇩 Bangladesh", name: "Dhaka" },
  { value: "Asia/Colombo", label: "🇱🇰 Sri Lanka", name: "Colombo" },
  { value: "Asia/Kathmandu", label: "🇳🇵 Nepal", name: "Kathmandu" },
  { value: "Asia/Thimphu", label: "🇧🇹 Bhutan", name: "Thimphu" },
  { value: "Asia/Rangoon", label: "🇲🇲 Myanmar", name: "Yangon" },
  { value: "Asia/Kabul", label: "🇦🇫 Afghanistan", name: "Kabul" },
  
  // Central Asia
  { value: "Asia/Tashkent", label: "🇺🇿 Uzbekistan", name: "Tashkent" },
  { value: "Asia/Almaty", label: "🇰🇿 Kazakhstan", name: "Almaty" },
  { value: "Asia/Bishkek", label: "🇰🇬 Kyrgyzstan", name: "Bishkek" },
  { value: "Asia/Dushanbe", label: "🇹🇯 Tajikistan", name: "Dushanbe" },
  { value: "Asia/Ashgabat", label: "🇹🇲 Turkmenistan", name: "Ashgabat" },
  { value: "Asia/Baku", label: "🇦🇿 Azerbaijan", name: "Baku" },
  { value: "Asia/Tbilisi", label: "🇬🇪 Georgia", name: "Tbilisi" },
  { value: "Asia/Yerevan", label: "🇦🇲 Armenia", name: "Yerevan" },
  
  // Southeast Asia
  { value: "Asia/Singapore", label: "🇸🇬 Singapore", name: "Singapore" },
  { value: "Asia/Bangkok", label: "🇹🇭 Thailand", name: "Bangkok" },
  { value: "Asia/Ho_Chi_Minh", label: "🇻🇳 Vietnam", name: "Ho Chi Minh" },
  { value: "Asia/Manila", label: "🇵🇭 Philippines", name: "Manila" },
  { value: "Asia/Jakarta", label: "🇮🇩 Indonesia (West)", name: "Jakarta" },
  { value: "Asia/Makassar", label: "🇮🇩 Indonesia (Central)", name: "Makassar" },
  { value: "Asia/Jayapura", label: "🇮🇩 Indonesia (East)", name: "Jayapura" },
  { value: "Asia/Kuala_Lumpur", label: "🇲🇾 Malaysia", name: "Kuala Lumpur" },
  { value: "Asia/Brunei", label: "🇧🇳 Brunei", name: "Bandar Seri Begawan" },
  { value: "Asia/Vientiane", label: "🇱🇦 Laos", name: "Vientiane" },
  { value: "Asia/Phnom_Penh", label: "🇰🇭 Cambodia", name: "Phnom Penh" },
  { value: "Asia/Dili", label: "🇹🇱 East Timor", name: "Dili" },
  
  // East Asia
  { value: "Asia/Tokyo", label: "🇯🇵 Japan", name: "Tokyo" },
  { value: "Asia/Seoul", label: "🇰🇷 South Korea", name: "Seoul" },
  { value: "Asia/Pyongyang", label: "🇰🇵 North Korea", name: "Pyongyang" },
  { value: "Asia/Shanghai", label: "🇨🇳 China", name: "Shanghai" },
  { value: "Asia/Hong_Kong", label: "🇭🇰 Hong Kong", name: "Hong Kong" },
  { value: "Asia/Taipei", label: "🇹🇼 Taiwan", name: "Taipei" },
  { value: "Asia/Macau", label: "🇲🇴 Macau", name: "Macau" },
  { value: "Asia/Ulaanbaatar", label: "🇲🇳 Mongolia", name: "Ulaanbaatar" },
  
  // Russian Asia
  { value: "Asia/Yekaterinburg", label: "🇷🇺 Russia (Ural)", name: "Yekaterinburg" },
  { value: "Asia/Novosibirsk", label: "🇷🇺 Russia (Siberia)", name: "Novosibirsk" },
  { value: "Asia/Krasnoyarsk", label: "🇷🇺 Russia (Krasnoyarsk)", name: "Krasnoyarsk" },
  { value: "Asia/Irkutsk", label: "🇷🇺 Russia (Irkutsk)", name: "Irkutsk" },
  { value: "Asia/Vladivostok", label: "🇷🇺 Russia (Far East)", name: "Vladivostok" },
  
  // Popular International (for reference)
  { value: "America/New_York", label: "🇺🇸 New York", name: "New York" },
  { value: "Europe/London", label: "🇬🇧 London", name: "London" },
  { value: "Europe/Paris", label: "🇫🇷 Paris", name: "Paris" },
   { value: "Africa/Cairo", label: "🇪🇬 Egypt", name: "Cairo" }
];

  // Get current timezone info
  const currentTimezoneInfo = timezoneOptions.find(tz => tz.value === timezone);
  const timezoneOffset = getTimezoneOffset(timezone);

  // Handle timezone change with validation
  const handleTimezoneChange = (newTimezone) => {
    try {
      // Test if timezone is valid
      new Intl.DateTimeFormat('en-US', { timeZone: newTimezone });
      setTimezone(newTimezone);
    } catch (error) {
      console.error('Invalid timezone selected:', newTimezone, error);
      // Keep current timezone if invalid
    }
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold">Select a Date & Time</h3>
          <div className="flex items-center gap-2">
            {/* Timezone Selector */}
            <select
              value={timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="bg-black border border-gray-700 px-2 py-1 rounded-md text-xs"
            >
              {timezoneOptions.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} {getTimezoneOffset(tz.value)}
                </option>
              ))}
            </select>
            
            {/* Time Format Toggle */}
            <div className="bg-black border border-gray-700 rounded-md flex">
              <button
                onClick={() => setTimeFormat('12h')}
                className={`px-2 py-1 text-xs rounded-l-md transition-colors ${
                  timeFormat === '12h' ? 'bg-blue-600 text-white' : 'text-gray-400'
                }`}
              >
                12h
              </button>
              <button
                onClick={() => setTimeFormat('24h')}
                className={`px-2 py-1 text-xs rounded-r-md transition-colors ${
                  timeFormat === '24h' ? 'bg-blue-600 text-white' : 'text-gray-400'
                }`}
              >
                24h
              </button>
            </div>
          </div>
        </div>

        {/* Current timezone display */}
        <div className="mb-3 text-xs text-gray-400">
          Current timezone: {currentTimezoneInfo?.name || timezone} ({timezoneOffset})
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
                  if (isClickable) setSelectedDate(day);
                }}
                className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200
                  ${
                    isSelected
                      ? "bg-white text-black font-bold"
                      : isClickable
                      ? "bg-white-700 text-white hover:bg-white hover:text-black border border-green-500"
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
            {selectedDate?.toLocaleDateString("en-GB")} at {selectedTime}
          </span>
        </div>

        <div className="flex justify-between mb-3 text-xs text-gray-400">
          <span className={`px-3 py-1 rounded-full ${timeFormat === '12h' ? 'bg-blue-600' : 'bg-gray-800'}`}>
            12h
          </span>
          <span className={`px-3 py-1 rounded-full ${timeFormat === '24h' ? 'bg-blue-600' : 'bg-gray-800'}`}>
            24h
          </span>
        </div>

        <div className="space-y-2 flex items-center flex-col">
          {timeSlots && timeSlots.length > 0 ? (
            timeSlots.map((slot, index) => (
              <button
                key={`${slot}-${index}`} // Use index as backup key
                onClick={() => {
                  if (selectedDate && slot) {
                    setSelectedTime(slot);
                    setShowForm(true);
                  }
                }}
                className={`py-2 w-full text-sm rounded-md border border-gray-700 transition-all flex justify-center items-center gap-2
                  ${
                    selectedDate && slot
                      ? selectedTime === slot
                        ? "bg-blue-600 text-white"
                        : "bg-black text-white hover:bg-blue-700"
                      : "opacity-50 cursor-not-allowed"
                  }`}
              >
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                {slot}
              </button>
            ))
          ) : (
            <div className="border border-red-600 text-red-500 px-4 py-6 rounded text-center text-sm">
              <p>No slots available on any upcoming day.</p>
              <p className="text-xs mt-1">Times shown in {currentTimezoneInfo?.name || timezone} timezone</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelector;
