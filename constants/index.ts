export const dummyChats = [
  {
    id: "1",
    title: "Skin Condition Analysis",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
  },
  {
    id: "2",
    title: "Symptom Consultation",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
  },
  {
    id: "3",
    title: "Medication Inquiry",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
  },
  {
    id: "4",
    title: "Diet Recommendations",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Previous 7 days
  },
  {
    id: "5",
    title: "Exercise Plan",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Previous 7 days
  },
  {
    id: "6",
    title: "Plant Disease Detection",
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Previous 30 days
  },
  {
    id: "7",
    title: "Chat 7",
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
  },
  {
    id: "8",
    title: "Chat 8",
    timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), // 16 days ago
  },
  {
    id: "9",
    title: "Chat 9",
    timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // 18 days ago
  },
  {
    id: "10",
    title: "Chat 10",
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
  },
  {
    id: "11",
    title: "Chat 11",
    timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), // 22 days ago
  },
  {
    id: "12",
    title: "Chat 12",
    timestamp: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), // 24 days ago
  },
  {
    id: "13",
    title: "Chat 13",
    timestamp: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000), // 26 days ago
  },
  {
    id: "14",
    title: "Chat 14",
    timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
  },
  {
    id: "15",
    title: "Chat 15",
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  },
  {
    id: "16",
    title: "Chat 16",
    timestamp: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000), // 32 days ago
  },
  {
    id: "17",
    title: "Chat 17",
    timestamp: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000), // 34 days ago
  },
  {
    id: "18",
    title: "Chat 18",
    timestamp: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000), // 36 days ago
  },
  {
    id: "19",
    title: "Chat 19",
    timestamp: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000), // 38 days ago
  },
  {
    id: "20",
    title: "Chat 20",
    timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
  },
];

// Group chats by time period
export const yesterdayChats = dummyChats.filter(
  (chat) =>
    chat.timestamp > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) &&
    chat.timestamp <= new Date(Date.now() - 24 * 60 * 60 * 1000)
);

export const previousWeekChats = dummyChats.filter(
  (chat) =>
    chat.timestamp > new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) &&
    chat.timestamp <= new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
);

export const previousMonthChats = dummyChats.filter(
  (chat) =>
    chat.timestamp > new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) &&
    chat.timestamp <= new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
);
