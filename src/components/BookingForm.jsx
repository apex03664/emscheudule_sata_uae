import { useState, useEffect, useMemo } from "react";
import { bookAppointment, getSlotConfig } from "./../../apis/apis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuccessModal from "./BookingForm/SuccessModel";
import RegistrationForm from "./BookingForm/RegistrationForm";
import DateTimeSelector from "./BookingForm/DateTimeSelector";
import { format } from "date-fns";
import useBatch from "./useBatch";

const BookingForm = () => {
  const today = new Date();

  // Use batch from API
  const { currentBatch, loading: batchLoading, error: batchError } = useBatch();

  // Compute batch options: current + 2 previous batches if available
  const batchOptions = [];
  if (currentBatch !== null) {
    batchOptions.push(currentBatch);
    if (currentBatch > 99) batchOptions.push(currentBatch - 1);
    if (currentBatch > 100) batchOptions.push(currentBatch - 2);
  } else {
    // Show fallback batch if API not loaded
    batchOptions.push("Can't fetch ! Kindly book and inform us");
  }

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateSlotMap, setDateSlotMap] = useState({});
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [timezone, setTimezone] = useState("Asia/Dubai"); // Default to UAE
  const [timeFormat, setTimeFormat] = useState("12h"); // Default to 12-hour format
  const [currentMonthDays, setCurrentMonthDays] = useState([]);

  // Form state, initialize batchNo using currentBatch when available
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    grade: "",
    countryCode: "+971", // UAE country code
    batchNo: currentBatch !== null ? currentBatch.toString() : "100",
    parentConfirmed: false,
  });

  // Update batchNo on currentBatch change or selectedDate change
  useEffect(() => {
    if (currentBatch !== null) {
      setForm((prev) => ({ ...prev, batchNo: currentBatch.toString() }));
    }
  }, [currentBatch]);

  // Generate calendar days for current month with timezone support
  useEffect(() => {
    const generateMonthDays = (year, month) => {
      const days = [];
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      for (let i = 0; i < first.getDay(); i++) days.push(null);
      for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
      return days;
    };
    setCurrentMonthDays(generateMonthDays(currentYear, currentMonth));
  }, [currentYear, currentMonth]);

  // Helper function to validate timezone
  const isValidTimezone = (timezone) => {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Helper function to convert time to selected timezone with proper error handling
  const convertTimeToTimezone = (timeString, targetTimezone) => {
    try {
      // Validate inputs
      if (!timeString || typeof timeString !== 'string') {
        console.warn('Invalid timeString provided:', timeString);
        return timeString || '';
      }

      if (!isValidTimezone(targetTimezone)) {
        console.warn('Invalid timezone provided:', targetTimezone);
        return timeString;
      }

      // Split time string safely
      const parts = timeString.split(" ");
      if (parts.length !== 2) {
        console.warn('Invalid time format:', timeString);
        return timeString;
      }

      const [time, meridian] = parts;
      const timeParts = time.split(":");
      if (timeParts.length !== 2) {
        console.warn('Invalid time format:', timeString);
        return timeString;
      }

      let [hours, minutes] = timeParts.map(Number);

      // Validate hours and minutes
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 12 || minutes < 0 || minutes >= 60) {
        console.warn('Invalid hour/minute values:', hours, minutes);
        return timeString;
      }

      // Convert to 24-hour format
      if (meridian === "PM" && hours !== 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;

      // Create a date object with today's date and the specified time
      const today = new Date();
      const dateWithTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0, 0);

      // Validate the created date
      if (isNaN(dateWithTime.getTime())) {
        console.warn('Invalid date created from:', timeString);
        return timeString;
      }

      // Format according to target timezone and time format
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: targetTimezone,
        hour: timeFormat === '12h' ? 'numeric' : '2-digit',
        minute: '2-digit',
        hour12: timeFormat === '12h'
      });

      const formattedTime = formatter.format(dateWithTime);
      return formattedTime;
    } catch (error) {
      console.error('Error converting time:', error, 'Original time:', timeString);
      return timeString; // Return original time if conversion fails
    }
  };

  // Helper function to get timezone offset display
  const getTimezoneOffset = (timezone) => {
    try {
      if (!isValidTimezone(timezone)) {
        return 'GMT+00:00';
      }

      const now = new Date();
      const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));

      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'longOffset'
      });

      const parts = formatter.formatToParts(now);
      const offsetPart = parts.find(part => part.type === 'timeZoneName');

      if (offsetPart && offsetPart.value) {
        return offsetPart.value;
      }

      // Fallback method
      const targetTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
      const sign = offset >= 0 ? '+' : '-';
      const absOffset = Math.abs(offset);
      const hours = Math.floor(absOffset);
      const minutes = Math.round((absOffset - hours) * 60);
      return `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error getting timezone offset:', error);
      return 'GMT+00:00';
    }
  };

 // Fetch slots - Only show specific time slots
useEffect(() => {
  const fetchSlotConfig = async () => {
    try {
      const data = await getSlotConfig();
      const map = {};
      
      // Define the exact time slots you want to show
      const allowedTimeSlots = [
        "10:00-11:00 PM",  // First preferred slot
        "8:30-9:30 PM"     // Second preferred slot (exists in your data)
      ];
      
      data.forEach(({ date, slots }) => {
        // Filter slots to only include the allowed time slots
        const filteredSlots = slots.filter(slot => {
          // Direct string comparison for exact matching
          return allowedTimeSlots.includes(slot.time);
        });
        
        // Only add to map if there are filtered slots available
        if (filteredSlots.length > 0) {
          map[date] = filteredSlots;
          console.log(`📅 ${date}: Found ${filteredSlots.length} allowed slots:`, 
            filteredSlots.map(s => `${s.time} (${s.counselorEmail})`));
        }
      });
      
      console.log(`🎯 Filtered calendar shows ${Object.keys(map).length} dates with allowed slots`);
      setDateSlotMap(map);

      const now = new Date();
      now.setSeconds(0, 0);

      const sortedDates = Object.keys(map).sort();
      for (let dateStr of sortedDates) {
        const slots = map[dateStr];
        for (let slot of slots) {
          try {
            // Handle both 12-hour format parsing
            let timeStr = slot.time;
            let meridian = "PM"; // Default since both your slots are PM
            
            if (timeStr.includes(" ")) {
              [timeStr, meridian] = timeStr.split(" ");
            }
            
            // Extract start time from range (e.g., "8:30-9:30" -> "8:30")
            const startTime = timeStr.split("-")[0];
            let [hours, minutes] = startTime.split(":").map(Number);
            
            if (meridian === "PM" && hours !== 12) hours += 12;
            if (meridian === "AM" && hours === 12) hours = 0;

            const slotDate = new Date(`${dateStr}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`);

            if (!isNaN(slotDate.getTime()) && slotDate > now) {
              const selectedDateObj = new Date(dateStr);
              setSelectedDate(selectedDateObj);
              setSelectedTime("");
              console.log(`✅ Auto-selected first available slot: ${dateStr} at ${slot.time}`);
              return;
            }
          } catch (error) {
            console.warn('Error processing slot:', slot, error);
            continue;
          }
        }
      }
      setSelectedDate(null);
      setSelectedTime("");
      console.log(`ℹ️ No future slots available from allowed time slots`);
    } catch (err) {
      console.error("❌ Failed to fetch slots:", err);
    }
  };
  fetchSlotConfig();
}, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getOneHourLater = (timeStr) => {
    if (!timeStr) return "";

    try {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (isNaN(hours) || isNaN(minutes)) return timeStr;

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const date = new Date();
      date.setHours(hours + 1, minutes, 0, 0);

      if (isNaN(date.getTime())) return timeStr;

      // Format according to current time format preference
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: timeFormat === '12h' ? 'numeric' : '2-digit',
        minute: '2-digit',
        hour12: timeFormat === '12h'
      });

      return formatter.format(date);
    } catch (error) {
      console.error('Error calculating one hour later:', error);
      return timeStr;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return toast.error("📅 Please select a date and time.");

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailValid) return toast.error("📧 Enter a valid email address");

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const slotList = dateSlotMap[dateStr] || [];
    const selectedSlotObj = slotList.find((s) => s.time === selectedTime);
    if (!selectedSlotObj) return toast.error("❌ Selected time is invalid");

    try {
      const response = await bookAppointment({
        ...form,
        date: dateStr,
        program: `ISRO MISSIONS WORKSHOP (5TH TO 9TH) SATA`,
        time: selectedTime,
        counselorEmail: selectedSlotObj.counselorEmail,
        counselorId: selectedSlotObj.counselorId,
        timezone: timezone, // Include selected timezone
      });

      if (response.success || response.booking?._id) {
        setShowSuccess(true);
        toast.success(`✅ Booking confirmed!`);
        resetForm();
      } else {
        toast.error(response);
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.message || err);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      location: "",
      grade: "",
      countryCode: "+971", // UAE country code
      batchNo: "1",
      parentConfirmed: false,
    });
    setSelectedDate(null);
    setSelectedTime("");
    setShowForm(false);
  };

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;

  // Safe time slot conversion with error handling
  const timeSlots = useMemo(() => {
    if (!selectedDateStr || !dateSlotMap[selectedDateStr]) {
      return [];
    }

    try {
      const slots = dateSlotMap[selectedDateStr];
      const uniqueTimes = [...new Set(slots.map((s) => s.time))];

      return uniqueTimes
        .map((time) => convertTimeToTimezone(time, timezone))
        .filter((time) => time && time !== ''); // Filter out invalid conversions
    } catch (error) {
      console.error('Error processing time slots:', error);
      return [];
    }
  }, [selectedDateStr, dateSlotMap, timezone, timeFormat]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-black px-6 md:px-12 lg:px-20 py-10">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="w-full max-w-6xl">
        {!showForm ? (
          <DateTimeSelector
            timezone={timezone}
            setTimezone={setTimezone}
            timeFormat={timeFormat}
            setTimeFormat={setTimeFormat}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            currentYear={currentYear}
            setCurrentYear={setCurrentYear}
            currentMonthDays={currentMonthDays}
            today={today}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            timeSlots={timeSlots}
            setShowForm={setShowForm}
            dateSlotMap={dateSlotMap}
            getTimezoneOffset={getTimezoneOffset}
            convertTimeToTimezone={convertTimeToTimezone}
          />
        ) : (
          <div className="min-h-screen bg-black text-white px-4 py-8 md:px-10 flex items-center justify-center">
            <RegistrationForm
              form={form}
              setForm={setForm}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              getOneHourLater={getOneHourLater}
              setShowForm={setShowForm}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              batchOptions={batchOptions}
            />
          </div>
        )}
      </div>
      {showSuccess && <SuccessModal clientEmail={form.email} />}
    </div>
  );
};

export default BookingForm;
