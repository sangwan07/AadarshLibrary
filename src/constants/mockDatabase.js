
export const mockDatabase = {
  users: {
    '9876543210': { // User
      password: 'user123',
      name: 'Amit Kumar',
      role: 'user',
      profilePhoto: 'https://placehold.co/100x100/E6E6FA/333?text=AK',
      seatId: 'A5',
      bookHistory: [
        { bookName: 'The Alchemist', issueDate: '2024-07-01', returnDate: '2024-07-15' }
      ],
      attendance: { '2024-07-18': 'Present', '2024-07-17': 'Present' }
    },
    '1234567890': { // Operator
      password: 'op123',
      name: 'Riya Sharma',
      role: 'operator',
      profilePhoto: 'https://placehold.co/100x100/D2B48C/333?text=RS',
    },
  },
  seats: [
    { id: 'A1', status: 'Vacant' }, { id: 'A2', status: 'Vacant' }, { id: 'A3', status: 'Occupied' },
    { id: 'A4', status: 'Vacant' }, { id: 'A5', status: 'Occupied' }, { id: 'A6', status: 'Vacant' },
    { id: 'B1', status: 'Occupied' }, { id: 'B2', status: 'Vacant' }, { id: 'B3', status: 'Vacant' },
    { id: 'B4', status: 'Occupied' }, { id: 'B5', status: 'Vacant' }, { id: 'B6', status: 'Vacant' },
  ],
  issuedBooks: [
      { studentName: 'Amit Kumar', phone: '9876543210', bookName: 'The Alchemist', bookNumber: 'BK-001', issueDate: '2024-07-01', lastDate: '2024-07-15' }
  ]
};

