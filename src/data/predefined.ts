/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrailerProfile, StorageLocation, Checklist, MaintenanceTask, InventoryItem } from '../types';

export const DEFAULT_TRAILERS: TrailerProfile[] = [
  {
    id: 'trailer-1',
    name: 'Aiden Forest 24HB',
    model: 'Forest River Rockwood Mini Lite',
    year: 2024,
    specs: {
      freshWaterCapacityGallons: 54,
      grayWaterCapacityGallons: 40,
      blackWaterCapacityGallons: 30,
      recommendedTirePressurePsi: 65,
      hitchWeightLbs: 685,
      cargoCapacityLbs: 1520,
    },
    status: {
      freshWaterLevelPercent: 80,
      grayWaterLevelPercent: 15,
      blackWaterLevelPercent: 5,
      batteryVoltage: 13.1,
      tirePressurePsiFrontLeft: 64,
      tirePressurePsiFrontRight: 64,
      tirePressurePsiRearLeft: 65,
      tirePressurePsiRearRight: 65,
    },
  },
  {
    id: 'trailer-2',
    name: 'The Big Rig 32BHS',
    model: 'Grand Design Imagine',
    year: 2023,
    specs: {
      freshWaterCapacityGallons: 85,
      grayWaterCapacityGallons: 90,
      blackWaterCapacityGallons: 45,
      recommendedTirePressurePsi: 80,
      hitchWeightLbs: 890,
      cargoCapacityLbs: 2100,
    },
    status: {
      freshWaterLevelPercent: 20,
      grayWaterLevelPercent: 65,
      blackWaterLevelPercent: 40,
      batteryVoltage: 12.4,
      tirePressurePsiFrontLeft: 79,
      tirePressurePsiFrontRight: 78,
      tirePressurePsiRearLeft: 80,
      tirePressurePsiRearRight: 79,
    },
  }
];

export const getDefaultStorageLocations = (trailerId: string): StorageLocation[] => [
  {
    id: `${trailerId}-loc-1`,
    trailerId,
    name: 'Front Pass-Through',
    description: 'Large external belly storage compartment at the front of the trailer. Best for heavy hookup items & camp chairs.',
  },
  {
    id: `${trailerId}-loc-2`,
    trailerId,
    name: 'Under-Bed Storage',
    description: 'Hydraulic lift storage under the main master bed. Good for linens, seasonal clothes, and spare gear.',
  },
  {
    id: `${trailerId}-loc-3`,
    trailerId,
    name: 'Kitchen Pantry & Cabinets',
    description: 'Internal overhead and lower cabinets in the kitchen area. Plates, pots, and food inventory.',
  },
  {
    id: `${trailerId}-loc-4`,
    trailerId,
    name: 'Rear Bumper / Hose Tube',
    description: 'Sewer hose storage tube in bumper and external bumper mount bins. Best for dirty sewer hose and elbows.',
  },
  {
    id: `${trailerId}-loc-5`,
    trailerId,
    name: 'Tool Box & A-Frame',
    description: 'Tongue-mounted security box behind the LP tanks. Hand tools, blocks, hitch grease and leveling accessories.',
  }
];

export const getDefaultChecklists = (trailerId: string): Checklist[] => [
  {
    id: `${trailerId}-chk-1`,
    trailerId,
    name: 'Before Travel checklist',
    category: 'Travel',
    isPredefined: true,
    steps: [
      {
        id: 'step-1-1',
        title: 'Secure Interior',
        isCompleted: false,
        notes: 'Prevent items flying around or breaking during transit.',
        substeps: [
          { id: 'sub-1-1-1', title: 'Close and lock all windows & vents', isCompleted: false },
          { id: 'sub-1-1-2', title: 'Secure sliding doors, shower door & closet latch', isCompleted: false },
          { id: 'sub-1-1-3', title: 'Lock refrigerator and freezer designer doors', isCompleted: false },
          { id: 'sub-1-1-4', title: 'Place loose items on floor or secure in cabinets', isCompleted: false },
          { id: 'sub-1-1-5', title: 'Retract slide-outs fully and check for clearance', isCompleted: false }
        ]
      },
      {
        id: 'step-1-2',
        title: 'Hitch Connection & Chassis',
        isCompleted: false,
        notes: 'Critical safety checks prior to pulling onto the road.',
        videoLink: 'https://www.youtube.com/watch?v=gIDZ4h8Gvrs',
        substeps: [
          { id: 'sub-1-2-1', title: 'Lower coupler onto ball, verify latch is fully locked with safety pin', isCompleted: false },
          { id: 'sub-1-2-2', title: 'Mount and tighten weight distribution bars (if equipped)', isCompleted: false },
          { id: 'sub-1-2-3', title: 'Attach safety chains (crisscrossed) and emergency breakaway cable', isCompleted: false },
          { id: 'sub-1-2-4', title: 'Plug in 7-way umbilical cable and verify trailer brake controller responds', isCompleted: false },
          { id: 'sub-1-2-5', title: 'Retract tongue jack fully and raise footplate block', isCompleted: false }
        ]
      },
      {
        id: 'step-1-3',
        title: 'Exterior Perimeter Walk',
        isCompleted: false,
        notes: 'Walk around trailer clockwise checking all exterior equipment.',
        substeps: [
          { id: 'sub-1-3-1', title: 'Retract stabilizer jacks fully and store tools', isCompleted: false },
          { id: 'sub-1-3-2', title: 'Check tire pressures and verify lug nuts are snug', isCompleted: false },
          { id: 'sub-1-3-3', title: 'Verify entry steps are folded away & grab handle is locked inward', isCompleted: false },
          { id: 'sub-1-3-4', title: 'Lock all cargo hatches and utility doors securely', isCompleted: false },
          { id: 'sub-1-3-5', title: 'Disconnect and store water, sewer, and electric hookups', isCompleted: false }
        ]
      },
      {
        id: 'step-1-4',
        title: 'Final Light Check',
        isCompleted: false,
        notes: 'Perform with a spotter or visual feedback.',
        substeps: [
          { id: 'sub-1-4-1', title: 'Verify left & right turn signals function', isCompleted: false },
          { id: 'sub-1-4-2', title: 'Verify tail/running lights are fully lit', isCompleted: false },
          { id: 'sub-1-4-3', title: 'Verify brake lights activate clearly', isCompleted: false }
        ]
      }
    ]
  },
  {
    id: `${trailerId}-chk-2`,
    trailerId,
    name: 'Campsite Set Up',
    category: 'Set Up',
    isPredefined: true,
    steps: [
      {
        id: 'step-2-1',
        title: 'Position & Level',
        isCompleted: false,
        notes: 'Choose site location carefully, allowing slide clearance.',
        substeps: [
          { id: 'sub-2-1-1', title: 'Check overhead clearances (trees, wires) and slide-out clearance', isCompleted: false },
          { id: 'sub-2-1-2', title: 'Level side-to-side using leveling blocks under tires', isCompleted: false },
          { id: 'sub-2-1-3', title: 'Place tire chocks tightly in front of and behind wheels', isCompleted: false },
          { id: 'sub-2-1-4', title: 'Disconnect chains, 7-way plug, breakaway cable and unhitch coupler', isCompleted: false },
          { id: 'sub-2-1-5', title: 'Level front-to-back using the tongue jack', isCompleted: false }
        ]
      },
      {
        id: 'step-2-2',
        title: 'Stabilize & Open',
        isCompleted: false,
        notes: 'Stabilizers prevent rocking, do not use to lift trailer!',
        substeps: [
          { id: 'sub-2-2-1', title: 'Place pads under stabilizer jacks, extend them and snug to ground', isCompleted: false },
          { id: 'sub-2-2-2', title: 'Connect shoreline water, sewer lines & electric plug', isCompleted: false },
          { id: 'sub-2-2-3', title: 'Verify slide-out pathways inside & outside are empty, then extend slides', isCompleted: false },
          { id: 'sub-2-2-4', title: 'Lower steps and configure entrance entry handle', isCompleted: false }
        ]
      },
      {
        id: 'step-2-3',
        title: 'Utility Hookup & Interior Turn On',
        isCompleted: false,
        notes: 'Verify utility feeds are safe before powering devices.',
        substeps: [
          { id: 'sub-2-3-1', title: 'Turn on park water valve and check for pipe connection leaks', isCompleted: false },
          { id: 'sub-2-3-2', title: 'Purge air from lines, fill water heater, then turn water heater switch ON', isCompleted: false },
          { id: 'sub-2-3-3', title: 'Switch refrigerator/appliances from LP to Auto/AC power', isCompleted: false },
          { id: 'sub-2-3-4', title: 'Unroll patio awning and anchor nicely (tilt slightly for rain run-off)', isCompleted: false }
        ]
      }
    ]
  },
  {
    id: `${trailerId}-chk-3`,
    trailerId,
    name: 'Winterization checklist',
    category: 'Winterize',
    isPredefined: true,
    steps: [
      {
        id: 'step-3-1',
        title: 'Drain All Plumbing',
        isCompleted: false,
        notes: 'Water expands when frozen and breaks brass/plastic lines!',
        videoLink: 'https://www.youtube.com/watch?v=FOfx6xM6Rmo',
        substeps: [
          { id: 'sub-3-1-1', title: 'Empty fresh water tank, black tank, and gray water tanks fully', isCompleted: false },
          { id: 'sub-3-1-2', title: 'Open low point hot and cold water drains underneath trailer', isCompleted: false },
          { id: 'sub-3-1-3', title: 'Unscrew and remove anode rod/drain plug to empty water heater tank', isCompleted: false },
          { id: 'sub-3-1-4', title: 'Open all interior faucets to allow atmosphere pressure flow', isCompleted: false }
        ]
      },
      {
        id: 'step-3-2',
        title: 'Bypass Tank & Siphon Antifreeze',
        isCompleted: false,
        notes: 'Only use non-toxic Pink RV Antifreeze! Do not use automotive antifreeze.',
        substeps: [
          { id: 'sub-3-2-1', title: 'Switch water heater valves to BYPASS position (stops water heater filling)', isCompleted: false },
          { id: 'sub-3-2-2', title: 'Connect siphon hose to water pump winterizing valve, drop in pink jug', isCompleted: false },
          { id: 'sub-3-2-3', title: 'Turn pump on and run each indoor and outdoor faucet until pure pink flows', isCompleted: false },
          { id: 'sub-3-2-4', title: 'Flush toilet until pink flows; pour cup of pink antifreeze in all cup drains', isCompleted: false }
        ]
      }
    ]
  }
];

export const getDefaultMaintenanceTasks = (trailerId: string): MaintenanceTask[] => {
  const now = new Date();
  
  // Future dates
  const addMonths = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: `${trailerId}-maint-1`,
      trailerId,
      title: 'Check Tire Pressure & Lug Nuts',
      category: 'Safety',
      status: 'pending',
      intervalMonths: 1,
      intervalMiles: 500,
      lastCompletedDate: now.toISOString().split('T')[0],
      dueDate: addMonths(1),
      dueMiles: 500,
      notes: 'Check pressures cold. Torque lug nuts to 100 ft-lbs on custom wheels.',
    },
    {
      id: `${trailerId}-maint-2`,
      trailerId,
      title: 'Inspect Roof Seals & Lap Sealant',
      category: 'Exterior',
      status: 'pending',
      intervalMonths: 6,
      intervalMiles: 0,
      lastCompletedDate: '',
      dueDate: addMonths(2),
      dueMiles: 0,
      notes: 'Inspect sealants around fan openings, skylights, and side trim carefully. Look for hairline cracks or voids that can leaks.',
    },
    {
      id: `${trailerId}-maint-3`,
      trailerId,
      title: 'Lubricate Slide-outs, Seals & Jacks',
      category: 'Chassis',
      status: 'pending',
      intervalMonths: 6,
      intervalMiles: 1000,
      lastCompletedDate: '',
      dueDate: addMonths(3),
      dueMiles: 1000,
      notes: 'Apply slide seal conditioner to rubber sweeps. Use dry lubricant spray on stabilizers and slide rails.',
    },
    {
      id: `${trailerId}-maint-4`,
      trailerId,
      title: 'Sanitize Fresh Water Tank & System',
      category: 'Plumbing',
      status: 'pending',
      intervalMonths: 6,
      intervalMiles: 0,
      lastCompletedDate: '',
      dueDate: addMonths(1),
      dueMiles: 0,
      notes: 'Pour 1/4 cup unscented bleach per 15 gals of water, run through pipes, let sit 4 hours, flush fully.',
    },
    {
      id: `${trailerId}-maint-5`,
      trailerId,
      title: 'Service Hand Bearings & Brake Linings',
      category: 'Chassis',
      status: 'pending',
      intervalMonths: 12,
      intervalMiles: 12000,
      lastCompletedDate: '',
      dueDate: addMonths(9),
      dueMiles: 12000,
      notes: 'Pack wheel bearings with high quality red grease. Check brake lining thickness and adjust magnets.',
    },
    {
      id: `${trailerId}-maint-6`,
      trailerId,
      title: 'Test Clean Detectors: Propane, CO & Smoke',
      category: 'Safety',
      status: 'pending',
      intervalMonths: 3,
      intervalMiles: 0,
      lastCompletedDate: now.toISOString().split('T')[0],
      dueDate: addMonths(3),
      dueMiles: 0,
      notes: 'Press the test button and verify alarm sound. Replace battery on smoke alarms annually. Vacuum dust out.',
    }
  ];
};

export const getDefaultInventory = (trailerId: string): InventoryItem[] => {
  const l1 = `${trailerId}-loc-1`; // Pass-through
  const l2 = `${trailerId}-loc-2`; // Under-bed
  const l3 = `${trailerId}-loc-3`; // Kitchen
  const l4 = `${trailerId}-loc-4`; // Sewer hose
  const l5 = `${trailerId}-loc-5`; // Engine/Tool box

  return [
    {
      id: `${trailerId}-inv-1`,
      trailerId,
      name: 'Fresh Water Hose (Blue, 25ft)',
      category: 'Setup & Hitch',
      quantity: 1,
      storageLocationId: l1,
      notes: 'Only use drinking water safe hoses. Keep rubber end caps screwed on to prevent bugs.',
      minQuantity: 1,
    },
    {
      id: `${trailerId}-inv-2`,
      trailerId,
      name: 'Water Pressure Regulator',
      category: 'Setup & Hitch',
      quantity: 1,
      storageLocationId: l1,
      notes: 'Brass regulator. Always attach to park faucet before hose to protect connections.',
      minQuantity: 1,
    },
    {
      id: `${trailerId}-inv-3`,
      trailerId,
      name: 'Sewer Hose Kit with Elbow (15ft)',
      category: 'Setup & Hitch',
      quantity: 2,
      storageLocationId: l4,
      notes: 'Stored in orange bags. Has clear bayonet elbow connector.',
      minQuantity: 1,
    },
    {
      id: `${trailerId}-inv-4`,
      trailerId,
      name: 'Folding Campsite Chairs',
      category: 'Camping Gear',
      quantity: 4,
      storageLocationId: l1,
      notes: 'Green Coleman chairs with side cup holders.',
      minQuantity: 2,
    },
    {
      id: `${trailerId}-inv-5`,
      trailerId,
      name: 'Spare T-Handle Levelling Blocks',
      category: 'Setup & Hitch',
      quantity: 10,
      storageLocationId: l5,
      notes: 'Interlocking orange plastic squares. Used with chocks to level trailer.',
      minQuantity: 10,
    },
    {
      id: `${trailerId}-inv-6`,
      trailerId,
      name: 'Propane Gas Lighter',
      category: 'Kitchen',
      quantity: 2,
      storageLocationId: l3,
      notes: 'Stored in utility drawer next to stove.',
      minQuantity: 1,
    },
    {
      id: `${trailerId}-inv-7`,
      trailerId,
      name: 'RV-Safe 1-Ply Toilet Paper Rolls',
      category: 'Bathroom',
      quantity: 6,
      storageLocationId: l2,
      notes: 'Dissolves easily to prevent blank tank system blockages. Never use residential plush TP!',
      minQuantity: 4,
    },
    {
      id: `${trailerId}-inv-8`,
      trailerId,
      name: 'Portable Torque Wrench & Sockets',
      category: 'Tools',
      quantity: 1,
      storageLocationId: l5,
      notes: 'For wheel lugs checks. Uses 3/4" deep socket.',
      minQuantity: 1,
    }
  ];
};
