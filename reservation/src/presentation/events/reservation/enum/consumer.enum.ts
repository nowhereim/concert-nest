export enum ConsumerType {
  CASH_USE = 'cash-use',
  SEAT_RESERVATION_FAILED = 'seat-reservation-failed',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  RESERVATION_EXPIRE = 'RESERVATION_EXPIRE',
  REPROCESS_PENDING_EVENTS = 'OUTBOX_REPROCESS',
}

export enum ConsumerGroup {
  CASH_USE_HANDLER_GROUP = 'cash-use-handler-group-a',
  SEAT_RESERVATION_HANDLER_GROUP = 'seat-reservation-handler-group-a',
  PAYMENT_HANDLER_GROUP = 'payment-handler-group-a',
  RESERVATION_EXPIRE_HANDLER_GROUP = 'reservation-expire-handler-group-a',
  REPROCESS_PENDING_EVENTS_GROUP = 'reprocess-pending-events-group-a',
}

export enum OutboxMarkerGroup {
  CASH_USE_OUTBOX_MARKER_GROUP = 'cash-use-outbox-marker-group-a',
  SEAT_RESERVATION_OUTBOX_MARKER_GROUP = 'seat-reservation-outbox-marker-group-a',
  PAYMENT_OUTBOX_MARKER_GROUP = 'payment-outbox-marker-group-a',
}
