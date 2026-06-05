export const ACTIVE_STATUSES = ['REQUESTED', 'CONFIRMED', 'BOOKED', 'ONGOING'];

export function isActiveBooking(booking) {
  return ACTIVE_STATUSES.includes(booking.status);
}

export function canPayBooking(booking) {
  return booking.status === 'CONFIRMED' && booking.paymentStatus !== 'COMPLETED';
}

export function canStartRide(booking) {
  return booking.status === 'BOOKED' && booking.paymentStatus === 'COMPLETED';
}

export function canCompleteRide(booking) {
  return booking.status === 'ONGOING';
}

export function canAcceptRide(booking) {
  return booking.status === 'REQUESTED';
}

export function getStatusLabel(status) {
  const labels = {
    REQUESTED: 'Awaiting Driver',
    CONFIRMED: 'Pay Now',
    BOOKED: 'Fully Booked',
    ONGOING: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
}

export function getStatusColor(status) {
  switch (status) {
    case 'COMPLETED': return 'bg-black text-white';
    case 'ONGOING': return 'bg-gray-800 text-white';
    case 'BOOKED': return 'bg-green-600 text-white';
    case 'CONFIRMED': return 'bg-amber-500 text-white';
    case 'CANCELLED': return 'bg-gray-300 text-gray-700';
    default: return 'bg-gray-200 text-gray-700';
  }
}

export function computeRiderAnalytics(bookings) {
  return {
    total: bookings.length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    active: bookings.filter((b) => isActiveBooking(b)).length,
    paid: bookings.filter((b) => b.paymentStatus === 'COMPLETED').length,
    pendingPayment: bookings.filter((b) => canPayBooking(b)).length,
    totalSpent: bookings
      .filter((b) => b.paymentStatus === 'COMPLETED')
      .reduce((sum, b) => sum + (b.agreedFare || 0), 0),
  };
}

export function computeDriverAnalytics(bookings) {
  const completed = bookings.filter((b) => b.status === 'COMPLETED');
  const paid = bookings.filter((b) => b.paymentStatus === 'COMPLETED');
  return {
    total: bookings.length,
    active: bookings.filter((b) => isActiveBooking(b)).length,
    completed: completed.length,
    paidRides: paid.length,
    pendingPayment: bookings.filter((b) => b.status === 'CONFIRMED').length,
    awaitingStart: bookings.filter((b) => b.status === 'BOOKED').length,
    totalEarnings: paid.reduce((sum, b) => sum + (b.agreedFare || 0), 0),
    completedEarnings: completed.reduce((sum, b) => sum + (b.agreedFare || 0), 0),
  };
}
