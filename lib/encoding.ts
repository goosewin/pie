import type { Activity } from '@/types';
import pako from 'pako';

// Helper to convert Uint8Array to string of char codes
function uint8ArrayToString(arr: Uint8Array): string {
  return String.fromCharCode.apply(null, arr as unknown as number[]);
}

// Helper to convert string of char codes back to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

// Base64url encode (RFC 4648 section 5)
function base64UrlEncode(u8arr: Uint8Array): string {
  const binaryString = uint8ArrayToString(u8arr);
  const base64 = btoa(binaryString);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Base64url decode
function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' to make it a valid base64 string
  while (str.length % 4) {
    str += '=';
  }
  const base64String = atob(str);
  return stringToUint8Array(base64String);
}

export function serializeActivities(activities: Activity[]): string {
  try {
    const jsonString = JSON.stringify(activities);
    // Compress the JSON string using pako (deflate)
    const compressed = pako.deflate(jsonString); // Outputs Uint8Array
    // Encode the compressed bytes using base64url
    const encoded = base64UrlEncode(compressed);
    return encoded;
  } catch (error) {
    console.error("Serialization failed:", error);
    // Fallback or error handling: return empty string or throw
    return "";
  }
}

export function deserializeActivities(encodedData: string): Activity[] | null {
  try {
    // Decode from base64url to bytes
    const compressedBytes = base64UrlDecode(encodedData);
    // Decompress using pako (inflate)
    const jsonString = pako.inflate(compressedBytes, { to: 'string' }); // Inflate needs { to: 'string' }
    // Parse the JSON string
    const parsedData = JSON.parse(jsonString);

    // Basic validation: check if it's an array
    if (!Array.isArray(parsedData)) {
      console.warn("Deserialized data is not an array");
      return null;
    }
    // For now, we assume if it's an array, it's an array of Activities.
    // A more robust check should validate the structure of each element.
    return parsedData as Activity[]; // Still need a cast here, but parsedData is `any`
  } catch (error) {
    console.error("Deserialization failed:", error);
    return null; // Return null or throw an error on failure
  }
} 
