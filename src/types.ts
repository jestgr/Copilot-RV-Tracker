/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TrailerSpecStats {
  freshWaterCapacityGallons: number;
  grayWaterCapacityGallons: number;
  blackWaterCapacityGallons: number;
  recommendedTirePressurePsi: number;
  hitchWeightLbs: number;
  cargoCapacityLbs: number;
}

export interface TrailerStatus {
  freshWaterLevelPercent: number; // 0 to 100
  grayWaterLevelPercent: number;
  blackWaterLevelPercent: number;
  batteryVoltage: number; // e.g. 12.6, 13.2
  tirePressurePsiFrontLeft: number;
  tirePressurePsiFrontRight: number;
  tirePressurePsiRearLeft: number;
  tirePressurePsiRearRight: number;
}

export interface TrailerProfile {
  id: string;
  name: string;
  model: string;
  year: number;
  specs: TrailerSpecStats;
  status: TrailerStatus;
}

export interface MaintenanceTask {
  id: string;
  trailerId: string;
  title: string;
  category: 'Safety' | 'Plumbing' | 'Electrical' | 'Exterior' | 'Interior' | 'Chassis';
  status: 'pending' | 'completed';
  intervalMonths: number; // 0 if one-off
  intervalMiles: number; // 0 if none
  lastCompletedDate: string; // ISO string or ""
  dueDate: string; // ISO string
  dueMiles: number; // e.g. current mileage + interval
  notes: string;
}

export interface MaintenanceLogEntry {
  id: string;
  trailerId: string;
  taskId: string;
  taskTitle: string;
  completedDate: string;
  mileage: number;
  performedBy: string;
  notes: string;
  invoiceCost: number; // 0 if none
}

export interface StorageLocation {
  id: string;
  trailerId: string;
  name: string;
  description: string;
  image?: string; // base64 or URL
}

export interface InventoryItem {
  id: string;
  trailerId: string;
  name: string;
  category: 'Kitchen' | 'Safety' | 'Camping Gear' | 'Tools' | 'Bedding' | 'Bathroom' | 'Setup & Hitch' | 'Other';
  quantity: number;
  storageLocationId: string; // references StorageLocation
  image?: string; // base64 or URL
  notes: string;
  minQuantity: number; // for low stock warnings
}

export interface ChecklistSubStep {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface ChecklistStep {
  id: string;
  title: string;
  isCompleted: boolean;
  notes: string;
  videoLink?: string;
  image?: string; // base64 or URL
  substeps: ChecklistSubStep[];
}

export interface Checklist {
  id: string;
  trailerId: string;
  name: string;
  category: 'Travel' | 'Set Up' | 'Break Down' | 'Winterize' | 'Dewinterize' | 'Custom';
  isPredefined: boolean;
  steps: ChecklistStep[];
  notes?: string;
}
