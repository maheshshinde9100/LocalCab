package com.mahesh.LocalCab.booking;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import static com.mahesh.LocalCab.booking.BookingDtos.BookingResponse;
import static com.mahesh.LocalCab.booking.BookingDtos.CreateBookingRequest;
import static com.mahesh.LocalCab.booking.BookingDtos.UpdateStatusRequest;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    private final BookingSseService bookingSseService;

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
     * Get bookings for a specific rider
     */
    @GetMapping("/rider/{riderId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByRiderId(@PathVariable String riderId) {
        List<BookingResponse> bookings = bookingService.getBookingsByRiderId(riderId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get a specific booking by ID
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable String bookingId) {
        BookingResponse booking = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(booking);
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

    /**
     * Rider-only: cancel a booking
     */
    @PatchMapping("/{bookingId}/cancel/{riderId}")
    public ResponseEntity<BookingResponse> cancelBookingByRider(
            @PathVariable String bookingId,
            @PathVariable String riderId,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        BookingResponse response = bookingService.cancelBookingByRider(bookingId, riderId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get booking real-time updates via SSE stream.
     */
    @GetMapping("/{bookingId}/stream")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamBooking(@PathVariable String bookingId) {
        return bookingSseService.subscribe(bookingId);
    }

    /**
     * Driver: update driver location coordinates
     */
    @PatchMapping("/{bookingId}/location")
    public ResponseEntity<BookingResponse> updateLocation(
            @PathVariable String bookingId,
            @RequestParam Double latitude,
            @RequestParam Double longitude
    ) {
        BookingResponse response = bookingService.updateLocation(bookingId, latitude, longitude);
        return ResponseEntity.ok(response);
    }

    /**
     * Public config: get public credentials/parameters (e.g., Razorpay Key ID)
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getPublicConfig() {
        return ResponseEntity.ok(Map.of("razorpayKeyId", bookingService.getRazorpayKeyId()));
    }

    /**
     * Rider: initiate Razorpay Order creation
     */
    @PostMapping("/{bookingId}/razorpay-order")
    public ResponseEntity<BookingResponse> createRazorpayOrder(@PathVariable String bookingId) {
        BookingResponse response = bookingService.createRazorpayOrder(bookingId);
        return ResponseEntity.ok(response);
    }

    /**
     * Rider: verify payment signature after frontend transaction complete
     */
    @PostMapping("/{bookingId}/razorpay-verify")
    public ResponseEntity<BookingResponse> verifyRazorpayPayment(
            @PathVariable String bookingId,
            @RequestBody Map<String, String> payload
    ) {
        String paymentId = payload.get("razorpayPaymentId");
        String signature = payload.get("razorpaySignature");
        BookingResponse response = bookingService.verifyRazorpayPayment(bookingId, paymentId, signature);
        return ResponseEntity.ok(response);
    }
}


