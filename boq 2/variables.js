// Electrical items with rates
const ELECTRICAL_ITEMS = {
    wires1: { name: 'Complet Wiring', rate: 45000, defaultQty: 1, info: 'Complete electrical wiring for the entire apartment including all points, conduits, and wiring as per standard specifications. Includes copper wires of standard gauge.' },
    wires2: { name: 'only 16 amp Wiring', rate: 30000, defaultQty: 1, info: 'Dedicated 16 amp wiring for high-power appliances like AC, refrigerator, microwave, and geyser. Includes separate circuit and heavy-duty wires.' },
    switches: { name: 'Switches', rate: 210, defaultQty: 6, info: 'Modular switches with sleek design. Includes standard 6A/16A switches, sockets, and decorative plates. Available in white, silver, and black finishes.' },
    points: { name: 'Power Points', rate: 210, defaultQty: 4, info: 'Additional power points for appliances. Includes 6A/16A sockets with modular plate. Suitable for TV, refrigerator, microwave, and other appliances.' },
    fan: { name: 'Fans (basic)', rate: 1600, defaultQty: 5, info: 'Standard ceiling fans with 1200mm sweep. Includes regulator, installation, and balancing. Energy-efficient BLDC motor with 5-year warranty.' },
    light: { name: 'Lights', rate: 1500, defaultQty: 5, info: 'LED ceiling lights for rooms and passage. Includes warm white/cool white options. Energy-efficient with 2-year warranty. Premium designs available at extra cost.' },
    bell: { name: 'Door Bell', rate: 500, defaultQty: 1, info: 'Wireless door bell with multiple ringtone options. Includes bell unit and push button. Range up to 100 meters. Battery operated.' },
    exhaust: { name: 'Exhaust Fan', rate: 1500, defaultQty: 2, info: 'Wall-mounted exhaust fan for bathrooms/kitchen. 6-inch sweep with louvers. Includes installation. Energy-efficient and quiet operation.' },
    acfitting: { name: 'AC Fitting', rate: 2500, defaultQty: 2, info: 'Complete AC installation including copper piping, insulation, drain pipe, and concealed wiring. Suitable for 1-1.5 ton split AC. Includes wall drilling and bracket.' }
};

// Woodwork quality rates
const WOODWORK_RATES = {
    basic: 1150,
    premium: 1350,
    luxury: 1700
};

// Bathroom packages
const BATHROOM_PACKAGES = {
    basic: { name: 'Basic', price: 15000},
    premium: { name: 'Premium', price: 85000 },
    luxury: { name: 'Luxury', price: 150000}
};

// Wall finish rates
const WALL_RATES = {
    paint: { name: 'Paint', rate: 55 },
    wallpaper: { name: 'Wallpaper', rate: 145 },
    panel: { name: 'Panel', rate: 280 }
};

// Layout areas
const LAYOUTS = {
    unit1: { name: '3BHK - Unit 1', area: 645.48 ,  image: '../brocher/unit-1_3bhk.png'},
    unit2: { name: '3BHK - Unit 2', area: 644.86 ,  image: '../brocher/unit-2_3bhk.png'},
    unit3: { name: '2BHK - Unit 3', area: 559.82 ,  image: '../brocher/Unit-3(2 BHK).png'},
    unit4: { name: '2BHK - Unit 4', area: 566.61 ,  image: '../brocher/Unit-4(2 BHK).png'},
    unit5: { name: '3BHK - Unit 5', area: 645.26 ,  image: '../brocher/Unit-5(3 BHK).png'},
    unit6: { name: '1BHK - Unit 6', area: 348.04 ,  image: '../brocher/unit-1_3bhk.png'},
    unit7: { name: '1BHK - Unit 7', area: 398.86 ,  image: '../brocher/unit-1_3bhk.png'}
};

// Flooring rates
const FLOOR_RATES = {
    vitrified: { name: 'Vitrified Tiles', rate: 65 },
    wood: { name: 'Wooden Flooring', rate: 185 },
    marble: { name: 'Marble', rate: 250 }
};

// Door rates
const DOOR_RATES = {
    main: {
        flush: { name: 'Flush Door', rate: 18000 },
        veneer: { name: 'Veneer Door', rate: 38000 },
        premium: { name: 'Premium Door', rate: 55000 }
    },
    internal: {
        flush: { name: 'Flush Door', rate: 8000 },
        veneer: { name: 'Veneer Door', rate: 15000 },
        premium: { name: 'Premium Door', rate: 25000 }
    },
    handles: {
        standard: { name: 'Standard Handles', rate: 0 },
        premium: { name: 'Premium Handles', rate: 2500 },
        luxury: { name: 'Luxury Handles', rate: 6000 }
    }
};

// Step definitions
const STEPS = [
    { id: 1, name: 'Layout' },
    { id: 2, name: 'Electrical' },
    { id: 3, name: 'Woodwork' },
    { id: 4, name: 'Bathroom' },
    { id: 5, name: 'Walls' },
    { id: 6, name: 'Floor' },
    { id: 7, name: 'Doors' },
    { id: 8, name: 'Customer' },
    { id: 9, name: 'Summary' }
];
