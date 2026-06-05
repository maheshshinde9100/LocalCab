package com.mahesh.LocalCab.booking;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BookingSseService {

    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String bookingId) {
        SseEmitter emitter = new SseEmitter(180_000L); // 3 minutes timeout
        emitters.computeIfAbsent(bookingId, k -> new ArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(bookingId, emitter));
        emitter.onTimeout(() -> removeEmitter(bookingId, emitter));
        emitter.onError((e) -> removeEmitter(bookingId, emitter));

        // Send an initial connect event
        try {
            emitter.send(SseEmitter.event().name("connect").data("Connected to stream for booking: " + bookingId));
        } catch (IOException e) {
            removeEmitter(bookingId, emitter);
        }

        return emitter;
    }

    public void publish(String bookingId, BookingDtos.BookingResponse booking) {
        List<SseEmitter> bookingEmitters = emitters.get(bookingId);
        if (bookingEmitters != null) {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : bookingEmitters) {
                try {
                    emitter.send(SseEmitter.event().name("booking-update").data(booking));
                } catch (Exception e) {
                    deadEmitters.add(emitter);
                }
            }
            bookingEmitters.removeAll(deadEmitters);
        }
    }

    private void removeEmitter(String bookingId, SseEmitter emitter) {
        List<SseEmitter> bookingEmitters = emitters.get(bookingId);
        if (bookingEmitters != null) {
            bookingEmitters.remove(emitter);
            if (bookingEmitters.isEmpty()) {
                emitters.remove(bookingId);
            }
        }
    }
}
