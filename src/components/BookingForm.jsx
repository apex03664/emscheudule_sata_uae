import { useState, useEffect, useMemo } from "react";
import { bookAppointment, getAvailableSlots } from "./../../apis/apis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import SuccessModal from "./BookingForm/SuccessModel";
import RegistrationForm from "./BookingForm/RegistrationForm";
import DateTimeSelector from "./BookingForm/DateTimeSelector";
import { format } from "date-fns";
import useBatch from "./useBatch";

dayjs.extend(utc);
dayjs.extend(timezone);

const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return 'Asia/Dubai';
  }
};

const convertUTCToUserTimezone = (utcDateISO, utcTimeSlot, userTimezone) => {
  try {
    const [startTime] = utcTimeSlot.split('-');
    const utcDateStr = dayjs(utcDateISO).utc().format('YYYY-MM-DD');
    const utcStart = dayjs.utc(`${utcDateStr} ${startTime}`);
    
    if (!utcStart.isValid()) {
      return {
        displayTime: utcTimeSlot,
        date: utcDateStr,
        dateObj: new Date(utcDateStr)
      };
    }
    
    const userStart = utcStart.tz(userTimezone);
    const userEnd = userStart.add(1, 'hour');
    
    return {
      displayTime: `${userStart.format('h:mm A')}-${userEnd.format('h:mm A')}`,
      date: userStart.format('YYYY-MM-DD'),
      dateObj: userStart.toDate()
    };
  } catch (error) {
    return {
      displayTime: utcTimeSlot,
      date: dayjs(utcDateISO).format('YYYY-MM-DD'),
      dateObj: new Date(utcDateISO)
    };
  }
};

const BookingForm = () => {
  const { currentBatch } = useBatch();

  // ✅ Fixed batch logic - only show -1 and -2
  const batchOptions = useMemo(() => {
    const options = [];
    if (currentBatch !== null && currentBatch > 0) {
      options.push(currentBatch - 1);
      options.push(currentBatch - 2);
    }
    return options.length > 0 ? options : [99, 98]; // Fallback
  }, [currentBatch]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateSlotMap, setDateSlotMap] = useState({});
  const [userTimezone, setUserTimezone] = useState('Asia/Dubai'); // Default UAE

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    grade: "",
    countryCode: "+971", // UAE
    batchNo: batchOptions[0]?.toString() || "99",
    parentConfirmed: false,
  });

  useEffect(() => {
    if (batchOptions.length > 0) {
      setForm((prev) => ({ ...prev, batchNo: batchOptions[0].toString() }));
    }
  }, [currentBatch]);

  useEffect(() => {
     const fetchSlotConfig = async () => {
      try {
        // ✅ Use public API that returns UTC data
        const data = await getAvailableSlots(); // Changed from getSlotConfig
        const map = {};

        console.log(`🌍 User timezone: ${userTimezone}`);
        console.log(`📥 Received ${data.length} dates from backend (UTC format)`);
        console.log('Sample data:', data[0]);

        data.forEach(({ date, dateUTC, slots }) => {
          if (!slots || slots.length === 0) return;

          // ✅ Convert UTC slots to user's timezone
          const convertedSlots = slots.map(slot => {
            // Convert UTC to user's local timezone
            const converted = convertUTCToUserTimezone(dateUTC, slot.timeUTC, userTimezone);

            console.log(`🔄 Converting: UTC ${slot.timeUTC} → ${userTimezone} ${converted.displayTime}`);

            return {
              ...slot,
              timeUTC: slot.timeUTC, // Keep original UTC
              displayTime: converted.displayTime, // User's local time
              userDate: converted.date, // User's local date
              userDateObj: converted.dateObj
            };
          });

          // ✅ Group by user's local date (slots might shift dates across timezones)
          convertedSlots.forEach(slot => {
            const userDateStr = slot.userDate;
            if (!map[userDateStr]) {
              map[userDateStr] = [];
            }
            map[userDateStr].push(slot);
          });

          console.log(`✅ Processed ${convertedSlots.length} slots for ${date}`);
        });

        console.log(`🎯 Total available dates in ${userTimezone}: ${Object.keys(map).length}`);
        setDateSlotMap(map);

        // ✅ Auto-select first available slot
        const now = new Date();
        const sortedDates = Object.keys(map).sort();

        for (let dateStr of sortedDates) {
          const slots = map[dateStr];
          if (slots && slots.length > 0) {
            const firstSlot = slots[0];
            if (firstSlot.userDateObj > now) {
              setSelectedDate(new Date(dateStr));
              setSelectedTime("");
              console.log(`✅ Auto-selected: ${dateStr}`);
              return;
            }
          }
        }

        setSelectedDate(null);
        setSelectedTime("");
        console.log(`ℹ️ No future slots available`);
      } catch (err) {
        console.error("❌ Failed to fetch slots:", err);
        toast.error("Failed to load available slots");
      }
    };

    fetchSlotConfig();
  }, [userTimezone]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedDate || !selectedTime) {
    return toast.error("📅 Please select a date and time.");
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  if (!emailValid) return toast.error("📧 Enter a valid email address");

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const slotList = dateSlotMap[dateStr] || [];
  const selectedSlotObj = slotList.find((s) => s.displayTime === selectedTime);
  
  if (!selectedSlotObj) {
    return toast.error("❌ Selected time is invalid");
  }

  try {
    console.log('📤 UAE Booking:', {
      userTime: selectedTime,
      userTimezone,
      timeSlotUTC: selectedSlotObj.timeUTC,
      dateUTC: selectedSlotObj.userDateObj.toISOString()
    });

    const response = await bookAppointment({
      ...form,
      date: dateStr,
      program: "ISRO MISSIONS WORKSHOP 5TH TO 9TH SATA",
      time: selectedTime, // User's local time (for display)
      dateUTC: selectedSlotObj.userDateObj.toISOString(), // ✅ UTC date
      timeSlotUTC: selectedSlotObj.timeUTC, // ✅ UTC time (e.g., "16:30-17:30")
      timezone: userTimezone, // User's timezone (e.g., "Asia/Dubai")
      counselorEmail: selectedSlotObj.counselorEmail,
      counselorId: selectedSlotObj.counselorId,
    });

    if (response.success || response.booking?._id) {
      setShowSuccess(true);
      toast.success(`✅ Booking confirmed for ${selectedTime} (${userTimezone})!`);
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
      countryCode: "+971",
      batchNo: batchOptions[0]?.toString() || "99",
      parentConfirmed: false,
    });
    setSelectedDate(null);
    setSelectedTime("");
    setShowForm(false);
  };

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const timeSlots =
    selectedDateStr && dateSlotMap[selectedDateStr]
      ? [...new Set(dateSlotMap[selectedDateStr].map((s) => s.displayTime))]
      : [];

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      {!showForm ? (
        <DateTimeSelector
          timezone={userTimezone}
          setTimezone={setUserTimezone}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          timeSlots={timeSlots}
          setShowForm={setShowForm}
          dateSlotMap={dateSlotMap}
        />
      ) : (
        <RegistrationForm
          form={form}
          setForm={setForm}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          userTimezone={userTimezone}
          setShowForm={setShowForm}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          batchOptions={batchOptions}
        />
      )}
      {showSuccess && <SuccessModal clientEmail={form.email} />}
    </>
  );
};

export default BookingForm;
