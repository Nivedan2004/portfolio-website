// Owner-confirmed schedule: Seattle time, all hours except the listed class blocks.
// Kept on the server; visitors only receive bookable start/end times.
export const bookingSettings = {
  timezone: "America/Los_Angeles",
  duration: 60,
  noticeHours: 2,
  horizonDays: 60,
  hours: [
    { days: [0, 5, 6], start: "00:00", end: "24:00" },
    { days: [1, 3, 4], start: "00:00", end: "17:45" },
    { days: [1, 3, 4], start: "19:45", end: "24:00" },
    { days: [2], start: "00:00", end: "15:30" },
    { days: [2], start: "19:45", end: "24:00" },
  ],
};
