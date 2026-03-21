// Electrical items with rates
const ELECTRICAL_ITEMS = {
    wires1: { name: 'Complet Wiring', rate: 45000, defaultQty: 1 },
    wires2: { name: 'only 16 amp Wiring', rate: 30000, defaultQty: 1 },
    switches: { name: 'Switches', rate: 210, defaultQty: 6 },
    points: { name: 'Power Points', rate: 210, defaultQty: 4 },
    fan: { name: 'Fans (basic)', rate: 1600, defaultQty: 5 },
    light: { name: 'Lights', rate: 1500, defaultQty: 5 },
    bell: { name: 'Door Bell', rate: 500, defaultQty: 1 },
    exhaust: { name: 'Exhaust Fan', rate: 1500, defaultQty: 2 },
    acfitting: { name: 'AC Fitting', rate: 2500, defaultQty: 2 },

};

// Woodwork quality rates
const WOODWORK_RATES = {
    basic: 1150,
    premium: 1350,
    luxury: 1700
};

// Bathroom packages
const BATHROOM_PACKAGES = {
    basic: { name: 'Basic', price: 15000 },
    premium: { name: 'Premium', price: 85000 },
    luxury: { name: 'Luxury', price: 150000 }
};

// Wall finish rates
const WALL_RATES = {
    paint: { name: 'Paint', rate: 55 },
    wallpaper: { name: 'Wallpaper', rate: 145 },
    panel: { name: 'Panel', rate: 280 }
};

// Layout areas
const LAYOUTS = {
    unit1: { name: '3BHK - Unit 1', area: 645.48 },
    unit2: { name: '3BHK - Unit 2', area: 644.86 },
    unit3: { name: '2BHK - Unit 3', area: 559.82 },
    unit4: { name: '2BHK - Unit 4', area: 566.61 },
    unit5: { name: '3BHK - Unit 5', area: 645.26 },
    unit6: { name: '1BHK - Unit 6', area: 348.04 },
    unit7: { name: '1BHK - Unit 7', area: 398.86 }
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
