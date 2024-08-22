export enum ConsumerType {
  CASH_USE_FAILED = 'cash-use-failed',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  COMPLETE_RESERVATION_FAILED = 'complete-reservation-failed',
  COMPLETE_RESERVATION = 'complete-reservation',
}

export enum ConsumerGroup {
  CASH_USE_HANDLER_GROUP = 'cash-use-handler-group',
  PAYMENT_HANDLER_GROUP = 'payment-handler-group',
  COMPLETE_RESERVATION_HANDLER_GROUP = 'complete-reservation-handler-group',
  COMPLETE_RESERVATION_FAILED_HANDLER_GROUP = 'complete-reservation-failed-handler-group',
}

export enum OutboxMarkerGroup {
  CASH_USE_OUTBOX_MARKER_GROUP = 'cash-use-outbox-marker-group',
  PAYMENT_OUTBOX_MARKER_GROUP = 'payment-outbox-marker-group',
  COMPLETE_RESERVATION_OUTBOX_MARKER_GROUP = 'complete-reservation-outbox-marker-group',
  COMPLETE_RESERVATION_FAILED_OUTBOX_MARKER_GROUP = 'complete-reservation-failed-outbox-marker-group',
}
