export const MOCK_USERS = [
  { id: 1, name: "Alex Sharma", role: "Design", level: "Coordinator", isFreeNow: true, hours: 12, badges: { appreciate: 3, slap: 0 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", upi: "alex@okhdfc" },
  { id: 2, name: "Priya Patel", role: "Networking", level: "Representative", isFreeNow: false, hours: 24, badges: { appreciate: 5, slap: 1 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya", upi: "priya@oksbi" },
  { id: 3, name: "Rahul Singh", role: "Operations", level: "Coordinator", isFreeNow: true, hours: 8, badges: { appreciate: 1, slap: 0 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul", upi: "rahul@okaxis" },
  { id: 4, name: "Neha Gupta", role: "Media", level: "Coordinator", isFreeNow: true, hours: 15, badges: { appreciate: 4, slap: 0 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha", upi: "neha@okicici" },
  { id: 5, name: "Kabir Khan", role: "Networking", level: "Representative", isFreeNow: false, hours: 5, badges: { appreciate: 0, slap: 2 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kabir", upi: "kabir@okhdfc" },
  { id: 6, name: "Ananya Desai", role: "Design", level: "Representative", isFreeNow: true, hours: 18, badges: { appreciate: 6, slap: 0 }, phone: "+1234567890", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya", upi: "ananya@oksbi" },
];

export const MOCK_EVENTS = [
  { id: 1, title: "Alumni Meet 2026", date: "2026-03-25", time: "10:00 AM", status: "upcoming", type: "Flagship", team: [1, 2, 3], coordinators: [1] },
  { id: 2, title: "Guest Lecture: Tech Trends", date: "2026-03-20", time: "02:00 PM", status: "ongoing", type: "Seminar", team: [4, 5], coordinators: [4] },
  { id: 3, title: "Batch of '16 Reunion", date: "2026-02-15", time: "06:00 PM", status: "past", type: "Networking", team: [1, 2, 4, 6], coordinators: [6] },
  { id: 4, title: "Career Fair Prep", date: "2026-04-05", time: "09:00 AM", status: "upcoming", type: "Workshop", team: [3, 6], coordinators: [3] },
];
