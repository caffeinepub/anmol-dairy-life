export interface SMSOptions {
  phoneNumber: string;
  message: string;
}

/**
 * Constructs an SMS URI with the recipient phone number and message body
 * @param options - Phone number and message content
 * @returns Properly encoded SMS URI string
 */
export function createSMSUri({ phoneNumber, message }: SMSOptions): string {
  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhone = phoneNumber.replace(/[\s\-()]/g, '');
  
  // Encode the message body for URI
  const encodedMessage = encodeURIComponent(message);
  
  // Construct SMS URI
  // Format: sms:PHONE?body=MESSAGE (iOS) or sms:PHONE?body=MESSAGE (Android)
  return `sms:${cleanPhone}?body=${encodedMessage}`;
}

/**
 * Opens the device's native SMS application with pre-filled content
 * @param options - Phone number and message content
 */
export function openSMSApp(options: SMSOptions): void {
  const smsUri = createSMSUri(options);
  window.location.href = smsUri;
}
