package com.mahesh.LocalCab.booking;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mahesh.LocalCab.booking.BookingDtos.BookingResponse;
import static com.mahesh.LocalCab.booking.BookingDtos.CreateBookingRequest;
import static com.mahesh.LocalCab.booking.BookingDtos.UpdateStatusRequest;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    /**
     * Public endpoint: create a booking record after rider and driver agree on fare by phone.
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Driver-only: list bookings for the currently authenticated driver.
     */
    @GetMapping("/me")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        List<BookingResponse> bookings = bookingService.getBookingsForCurrentDriver();
        return ResponseEntity.ok(bookings);
    }

    /**
     * Driver-only: update booking status (CONFIRMED, ONGOING, COMPLETED, CANCELLED).
     */
    @PatchMapping("/{bookingId}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable("bookingId") String bookingId,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        BookingResponse response = bookingService.updateStatus(bookingId, request);
        return ResponseEntity.ok(response);
    }
}


