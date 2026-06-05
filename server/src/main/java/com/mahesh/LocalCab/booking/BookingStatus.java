package com.mahesh.LocalCab.booking;

public enum BookingStatus {
    REQUESTED,   // Customer submitted — awaiting driver acceptance
    CONFIRMED,   // Driver accepted — awaiting customer Razorpay payment
    BOOKED,      // Payment received — ride fully booked, driver can start
    ONGOING,     // Driver started the trip
    COMPLETED,   // Trip finished
    CANCELLED
}
