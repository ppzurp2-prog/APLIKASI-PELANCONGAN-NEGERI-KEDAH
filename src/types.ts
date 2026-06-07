/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'Heritage' | 'Nature' | 'Beach' | 'Family';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  district: string;
  category: Category;
  ticketPriceText: string;
  ticketPriceAdultMyKad: number;
  ticketPriceChildMyKad: number;
  ticketPriceAdultForeigner: number;
  ticketPriceChildForeigner: number;
  openingHours: string;
  location: string;
  coordinates: Coordinate;
  imageUrl: string;
  features: string[];
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
