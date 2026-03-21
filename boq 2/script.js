// Global state
let STATE = {
    layout: null,
    electrical: {
        items: {}
    },
    woodwork: {
        kitchen: {
            quality: null,
            area: 0
        },
        wardrobes: []
    },
    bathroom: null,
    walls: [],
    floor: {
        enabled: true,
        type: null
    },
    doors: {
        main: null,
        internal: {
            type: null,
            count: 3
        },
        handle: "standard"
    },
    customer: {
        name: "",
        email: "",
        phone: "",
        tower: "",
        floor: "",
        flat: ""
    },
    totals: {
        electrical: 0,
        woodwork: 0,
        bathroom: 0,
        walls: 0,
        floor: 0,
        doors: 0,
        grand: 0
    }
};

// Initialize state from localStorage
function loadState() {
    const saved = localStorage.getItem("projectState");
    if (saved) {
        try {
            STATE = JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load state", e);
        }
    }
    initializeElectricalItems();
}

// Initialize electrical items with default quantities
function initializeElectricalItems() {
    if (Object.keys(STATE.electrical.items).length === 0) {
        Object.keys(ELECTRICAL_ITEMS).forEach(key => {
            STATE.electrical.items[key] = {
                selected: false,
                qty: ELECTRICAL_ITEMS[key].defaultQty || 1
            };
        });
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem("projectState", JSON.stringify(STATE));
}

// Navigation
function goToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show selected step
    const stepEl = document.getElementById(`step${stepNumber}`);
    if (stepEl) {
        stepEl.style.display = 'block';
    }
    
    // Update progress bar (kept for compatibility)
    updateProgressBar(stepNumber);
    
    // Update sidebar
    document.querySelectorAll('.step-item').forEach((el, index) => {
        if (index + 1 === stepNumber) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    
    // Render step content
    renderStep(stepNumber);
}

// Progress bar removed - using sidebar only
function updateProgressBar(activeStep) {
    // Function kept for compatibility but does nothing
    return;
}

// Render current step
function renderStep(stepNumber) {
    switch(stepNumber) {
        case 1:
            renderLayout();
            break;
        case 2:
            renderElectrical();
            break;
        case 3:
            renderWoodwork();
            break;
        case 4:
            renderBathroom();
            break;
        case 5:
            renderWalls();
            break;
        case 6:
            renderFloor();
            break;
        case 7:
            renderDoors();
            break;
        case 8:
            renderCustomer();
            break;
        case 9:
            renderSummary();
            break;
    }
}

// Layout render
function renderLayout() {
    const grid = document.getElementById('layoutGrid');
    grid.innerHTML = '';
    
    Object.keys(LAYOUTS).forEach(key => {
        const layout = LAYOUTS[key];
        const card = document.createElement('div');
        card.className = `card ${STATE.layout === key ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="title">${layout.name}</div>
            <div class="price">${layout.area} sq ft</div>
        `;
        card.onclick = () => {
            if (STATE.layout === key) {
                STATE.layout = null;
            } else {
                STATE.layout = key;
            }
            saveState();
            renderLayout();
            recalculateTotals();
        };
        grid.appendChild(card);
    });
}

// Electrical render - now properly interactive
function renderElectrical() {
    const grid = document.getElementById('electricalGrid');
    grid.innerHTML = '';
    
    Object.keys(ELECTRICAL_ITEMS).forEach(key => {
        const item = ELECTRICAL_ITEMS[key];
        const state = STATE.electrical.items[key] || { selected: false, qty: 1 };
        
        const itemEl = document.createElement('div');
        itemEl.className = `electrical-item ${state.selected ? 'selected' : ''}`;
        itemEl.innerHTML = `
            <div class="electrical-header">
                <span class="electrical-name">${item.name}</span>
                <span class="electrical-price">₹${item.rate}</span>
            </div>
            <div class="electrical-qty">
                <input type="number" min="0" value="${state.qty}" class="qty-input" data-key="${key}" ${!state.selected ? 'disabled' : ''}>
                <span>Qty</span>
            </div>
        `;
        
        // Make the entire header clickable for selection
        const header = itemEl.querySelector('.electrical-header');
        header.style.cursor = 'pointer';
        header.onclick = (e) => {
            e.stopPropagation();
            // Toggle selection
            state.selected = !state.selected;
            STATE.electrical.items[key] = state;
            saveState();
            // Re-render to update UI
            renderElectrical();
            recalculateTotals();
        };
        
        // Handle quantity changes
        const qtyInput = itemEl.querySelector('.qty-input');
        qtyInput.onchange = (e) => {
            e.stopPropagation();
            const newQty = parseInt(e.target.value) || 0;
            state.qty = newQty;
            STATE.electrical.items[key] = state;
            saveState();
            recalculateTotals();
        };
        
        // Prevent click on input from triggering header click
        qtyInput.onclick = (e) => {
            e.stopPropagation();
        };
        
        grid.appendChild(itemEl);
    });
}

// Woodwork render
function renderWoodwork() {
    // Kitchen quality
    const qualityEl = document.getElementById('kitchenQuality');
    qualityEl.innerHTML = '';
    
    Object.keys(WOODWORK_RATES).forEach(key => {
        const option = document.createElement('div');
        option.className = `quality-option ${STATE.woodwork.kitchen.quality === key ? 'selected' : ''}`;
        option.innerHTML = `
            <div>${key.charAt(0).toUpperCase() + key.slice(1)}</div>
            <div class="rate">₹${WOODWORK_RATES[key]}/sq ft</div>
        `;
        option.onclick = () => {
            if (STATE.woodwork.kitchen.quality === key) {
                STATE.woodwork.kitchen.quality = null;
            } else {
                STATE.woodwork.kitchen.quality = key;
            }
            saveState();
            renderWoodwork();
            recalculateTotals();
        };
        qualityEl.appendChild(option);
    });
    
    // Kitchen area
    const areaInput = document.getElementById('kitchenArea');
    areaInput.value = STATE.woodwork.kitchen.area;
    areaInput.onchange = (e) => {
        STATE.woodwork.kitchen.area = parseFloat(e.target.value) || 0;
        saveState();
        recalculateTotals();
    };
    
    // Wardrobes
    renderWardrobes();
}

// Render wardrobes
function renderWardrobes() {
    const list = document.getElementById('wardrobesList');
    list.innerHTML = '';
    
    STATE.woodwork.wardrobes.forEach((wardrobe, index) => {
        const item = document.createElement('div');
        item.className = 'wardrobe-item';
        item.innerHTML = `
            <select id="wardrobe-quality-${index}">
                <option value="basic" ${wardrobe.quality === 'basic' ? 'selected' : ''}>Basic (₹${WOODWORK_RATES.basic})</option>
                <option value="premium" ${wardrobe.quality === 'premium' ? 'selected' : ''}>Premium (₹${WOODWORK_RATES.premium})</option>
                <option value="luxury" ${wardrobe.quality === 'luxury' ? 'selected' : ''}>Luxury (₹${WOODWORK_RATES.luxury})</option>
            </select>
            <input type="number" id="wardrobe-area-${index}" value="${wardrobe.area || 0}" min="0" step="0.1" placeholder="Area sq ft">
            <button onclick="removeWardrobe(${index})">Remove</button>
        `;
        
        // Quality change
        item.querySelector(`#wardrobe-quality-${index}`).onchange = (e) => {
            STATE.woodwork.wardrobes[index].quality = e.target.value;
            saveState();
            recalculateTotals();
        };
        
        // Area change
        item.querySelector(`#wardrobe-area-${index}`).onchange = (e) => {
            STATE.woodwork.wardrobes[index].area = parseFloat(e.target.value) || 0;
            saveState();
            recalculateTotals();
        };
        
        list.appendChild(item);
    });
}

// Add wardrobe
window.addWardrobe = function() {
    STATE.woodwork.wardrobes.push({
        quality: 'basic',
        area: 0
    });
    saveState();
    renderWoodwork();
    recalculateTotals();
};

// Remove wardrobe
window.removeWardrobe = function(index) {
    STATE.woodwork.wardrobes.splice(index, 1);
    saveState();
    renderWoodwork();
    recalculateTotals();
};

// Bathroom render
function renderBathroom() {
    const grid = document.getElementById('bathroomGrid');
    grid.innerHTML = '';
    
    Object.keys(BATHROOM_PACKAGES).forEach(key => {
        const pkg = BATHROOM_PACKAGES[key];
        const card = document.createElement('div');
        card.className = `card ${STATE.bathroom === key ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="title">${pkg.name}</div>
            <div class="price">₹${pkg.price.toLocaleString()}</div>
        `;
        card.onclick = () => {
            if (STATE.bathroom === key) {
                STATE.bathroom = null;
            } else {
                STATE.bathroom = key;
            }
            saveState();
            renderBathroom();
            recalculateTotals();
        };
        grid.appendChild(card);
    });
}

// Walls render
function renderWalls() {
    const list = document.getElementById('wallsList');
    list.innerHTML = '';
    
    STATE.walls.forEach((wall, index) => {
        const item = document.createElement('div');
        item.className = 'wall-item';
        item.innerHTML = `
            <select id="wall-type-${index}">
                <option value="paint" ${wall.type === 'paint' ? 'selected' : ''}>Paint (₹${WALL_RATES.paint.rate})</option>
                <option value="wallpaper" ${wall.type === 'wallpaper' ? 'selected' : ''}>Wallpaper (₹${WALL_RATES.wallpaper.rate})</option>
                <option value="panel" ${wall.type === 'panel' ? 'selected' : ''}>Panel (₹${WALL_RATES.panel.rate})</option>
            </select>
            <input type="number" id="wall-area-${index}" value="${wall.area || 0}" min="0" step="0.1" placeholder="Area sq ft">
            <button onclick="removeWall(${index})">Remove</button>
        `;
        
        // Type change
        item.querySelector(`#wall-type-${index}`).onchange = (e) => {
            STATE.walls[index].type = e.target.value;
            saveState();
            recalculateTotals();
        };
        
        // Area change
        item.querySelector(`#wall-area-${index}`).onchange = (e) => {
            STATE.walls[index].area = parseFloat(e.target.value) || 0;
            saveState();
            recalculateTotals();
        };
        
        list.appendChild(item);
    });
}

// Add wall
window.addWall = function() {
    STATE.walls.push({
        type: 'paint',
        area: 0
    });
    saveState();
    renderWalls();
    recalculateTotals();
};

// Remove wall
window.removeWall = function(index) {
    STATE.walls.splice(index, 1);
    saveState();
    renderWalls();
    recalculateTotals();
};

// Floor render
function renderFloor() {
    const toggle = document.getElementById('floorToggle');
    toggle.checked = STATE.floor.enabled;
    toggle.onchange = (e) => {
        STATE.floor.enabled = e.target.checked;
        if (!STATE.floor.enabled) {
            STATE.floor.type = null;
        }
        saveState();
        renderFloor();
        recalculateTotals();
    };
    
    const grid = document.getElementById('floorGrid');
    grid.innerHTML = '';
    
    if (STATE.floor.enabled) {
        Object.keys(FLOOR_RATES).forEach(key => {
            const floor = FLOOR_RATES[key];
            const card = document.createElement('div');
            card.className = `card ${STATE.floor.type === key ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="title">${floor.name}</div>
                <div class="price">₹${floor.rate}/sq ft</div>
            `;
            card.onclick = () => {
                if (STATE.floor.type === key) {
                    STATE.floor.type = null;
                } else {
                    STATE.floor.type = key;
                }
                saveState();
                renderFloor();
                recalculateTotals();
            };
            grid.appendChild(card);
        });
    }
}

// Doors render
function renderDoors() {
    // Main door
    const mainGrid = document.getElementById('mainDoorGrid');
    mainGrid.innerHTML = '';
    
    Object.keys(DOOR_RATES.main).forEach(key => {
        const door = DOOR_RATES.main[key];
        const card = document.createElement('div');
        card.className = `card ${STATE.doors.main === key ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="title">${door.name}</div>
            <div class="price">₹${door.rate.toLocaleString()}</div>
        `;
        card.onclick = () => {
            if (STATE.doors.main === key) {
                STATE.doors.main = null;
            } else {
                STATE.doors.main = key;
            }
            saveState();
            renderDoors();
            recalculateTotals();
        };
        mainGrid.appendChild(card);
    });
    
    // Internal doors
    const internalGrid = document.getElementById('internalDoorGrid');
    internalGrid.innerHTML = '';
    
    Object.keys(DOOR_RATES.internal).forEach(key => {
        const door = DOOR_RATES.internal[key];
        const card = document.createElement('div');
        card.className = `card ${STATE.doors.internal.type === key ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="title">${door.name}</div>
            <div class="price">₹${door.rate.toLocaleString()}</div>
        `;
        card.onclick = () => {
            if (STATE.doors.internal.type === key) {
                STATE.doors.internal.type = null;
            } else {
                STATE.doors.internal.type = key;
            }
            saveState();
            renderDoors();
            recalculateTotals();
        };
        internalGrid.appendChild(card);
    });
    
    // Door count
    const countInput = document.getElementById('internalDoorCount');
    countInput.value = STATE.doors.internal.count;
    countInput.onchange = (e) => {
        STATE.doors.internal.count = parseInt(e.target.value) || 0;
        saveState();
        recalculateTotals();
    };
    
    // Handles
    const handleGrid = document.getElementById('handleGrid');
    handleGrid.innerHTML = '';
    
    Object.keys(DOOR_RATES.handles).forEach(key => {
        const handle = DOOR_RATES.handles[key];
        const card = document.createElement('div');
        card.className = `card ${STATE.doors.handle === key ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="title">${handle.name}</div>
            <div class="price">${handle.rate > 0 ? `₹${handle.rate}/door` : 'Included'}</div>
        `;
        card.onclick = () => {
            if (STATE.doors.handle === key) {
                STATE.doors.handle = 'standard';
            } else {
                STATE.doors.handle = key;
            }
            saveState();
            renderDoors();
            recalculateTotals();
        };
        handleGrid.appendChild(card);
    });
}

// Customer render
function renderCustomer() {
    document.getElementById('customerName').value = STATE.customer.name || '';
    document.getElementById('customerEmail').value = STATE.customer.email || '';
    document.getElementById('customerPhone').value = STATE.customer.phone || '';
    document.getElementById('customerTower').value = STATE.customer.tower || '';
    document.getElementById('customerFloor').value = STATE.customer.floor || '';
    document.getElementById('customerFlat').value = STATE.customer.flat || '';
    
    document.getElementById('customerName').onchange = (e) => {
        STATE.customer.name = e.target.value;
        saveState();
        updateCustomerDisplay();
        updateButtonStates();
    };
    
    document.getElementById('customerEmail').onchange = (e) => {
        STATE.customer.email = e.target.value;
        saveState();
        updateButtonStates();
    };
    
    document.getElementById('customerPhone').onchange = (e) => {
        STATE.customer.phone = e.target.value;
        saveState();
        updateButtonStates();
    };
    
    document.getElementById('customerTower').onchange = (e) => {
        STATE.customer.tower = e.target.value;
        saveState();
    };
    
    document.getElementById('customerFloor').onchange = (e) => {
        STATE.customer.floor = e.target.value;
        saveState();
    };
    
    document.getElementById('customerFlat').onchange = (e) => {
        STATE.customer.flat = e.target.value;
        saveState();
    };
    
    // Initial button state check
    updateButtonStates();
}

// Update customer display
// function updateCustomerDisplay() {
//    const display = document.getElementById('customerDisplay');
//    if (STATE.customer.name) {
//        let html = `${STATE.customer.name}`;
//        if (STATE.customer.tower || STATE.customer.floor || STATE.customer.flat) {
//            html += `<br>${STATE.customer.tower || ''} ${STATE.customer.floor || ''} ${STATE.customer.flat || ''}`.trim();
//        }
//        html += `<br>${STATE.customer.email || ''}`;
//        html += `<br>${STATE.customer.phone || ''}`;
//        display.innerHTML = html;
//    } else {
//        display.innerHTML = 'Not provided';
//    }
//}









// Summary render - Full detailed version
function renderSummary() {
    // Customer Details
    document.getElementById('summaryCustomerName').textContent = STATE.customer.name || 'Not provided';
    let flatDetails = '';
    if (STATE.customer.tower || STATE.customer.floor || STATE.customer.flat) {
        flatDetails = `${STATE.customer.tower || ''} ${STATE.customer.floor || ''} ${STATE.customer.flat || ''}`.trim();
    }
    document.getElementById('summaryCustomerFlat').textContent = flatDetails || 'Not provided';
    document.getElementById('summaryCustomerEmail').textContent = STATE.customer.email || 'Not provided';
    document.getElementById('summaryCustomerPhone').textContent = STATE.customer.phone || 'Not provided';
    
    // Layout
    document.getElementById('summaryLayout').textContent = STATE.layout ? LAYOUTS[STATE.layout].name + ' (' + LAYOUTS[STATE.layout].area + ' sq ft)' : 'Not selected';
    
    // Electrical Items
    let electricalItemsHtml = '';
    let hasElectrical = false;
    Object.keys(STATE.electrical.items).forEach(key => {
        const item = STATE.electrical.items[key];
        if (item.selected && ELECTRICAL_ITEMS[key]) {
            hasElectrical = true;
            const rate = ELECTRICAL_ITEMS[key].rate;
            const qty = item.qty || 1;
            electricalItemsHtml += `
                <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px;">
                    <span>${ELECTRICAL_ITEMS[key].name} (${qty} x ₹${rate})</span>
                    <span style="color: #28a745;">₹${(rate * qty).toLocaleString()}</span>
                </div>
            `;
        }
    });
    if (!hasElectrical) {
        electricalItemsHtml = '<p style="color: #999; font-style: italic;">No items selected</p>';
    }
    document.getElementById('summaryElectricalItems').innerHTML = electricalItemsHtml;
    document.getElementById('summaryElectrical').textContent = `₹${STATE.totals.electrical.toLocaleString()}`;
    
    // Kitchen
    let kitchenHtml = '';
    if (STATE.woodwork.kitchen.quality && STATE.woodwork.kitchen.area > 0) {
        const rate = WOODWORK_RATES[STATE.woodwork.kitchen.quality];
        kitchenHtml = `
            <div>Quality: ${STATE.woodwork.kitchen.quality} (₹${rate}/sq ft)</div>
            <div>Area: ${STATE.woodwork.kitchen.area} sq ft</div>
            <div style="margin-top: 5px;">Cost: <strong>₹${(rate * STATE.woodwork.kitchen.area).toLocaleString()}</strong></div>
        `;
    } else {
        kitchenHtml = '<p style="color: #999; font-style: italic;">Not selected</p>';
    }
    document.getElementById('summaryKitchen').innerHTML = kitchenHtml;
    
    // Wardrobes
    let wardrobesHtml = '';
    if (STATE.woodwork.wardrobes.length > 0) {
        STATE.woodwork.wardrobes.forEach((wardrobe, index) => {
            if (wardrobe.quality && wardrobe.area > 0) {
                const rate = WOODWORK_RATES[wardrobe.quality];
                wardrobesHtml += `
                    <div style="margin-bottom: 8px;">
                        <strong>Wardrobe ${index + 1}:</strong> ${wardrobe.quality} (${wardrobe.area} sq ft @ ₹${rate}/sq ft)
                        <span style="float: right; color: #28a745;">₹${(rate * wardrobe.area).toLocaleString()}</span>
                    </div>
                `;
            }
        });
    }
    if (!wardrobesHtml) {
        wardrobesHtml = '<p style="color: #999; font-style: italic;">No wardrobes added</p>';
    }
    document.getElementById('summaryWardrobes').innerHTML = wardrobesHtml;
    document.getElementById('summaryWoodwork').textContent = `₹${STATE.totals.woodwork.toLocaleString()}`;
    
    // Bathroom
    let bathroomHtml = '';
    if (STATE.bathroom) {
        bathroomHtml = `
            <div>Package: ${BATHROOM_PACKAGES[STATE.bathroom].name}</div>
            <div>Price: ₹${BATHROOM_PACKAGES[STATE.bathroom].price.toLocaleString()}</div>
        `;
    } else {
        bathroomHtml = '<p style="color: #999; font-style: italic;">Not selected</p>';
    }
    document.getElementById('summaryBathroomDetails').innerHTML = bathroomHtml;
    document.getElementById('summaryBathroom').textContent = `₹${STATE.totals.bathroom.toLocaleString()}`;
    
    // Walls
    let wallsHtml = '';
    if (STATE.walls.length > 0) {
        STATE.walls.forEach((wall, index) => {
            if (wall.type && wall.area > 0) {
                const rate = WALL_RATES[wall.type].rate;
                wallsHtml += `
                    <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                        <span>Wall ${index + 1}: ${WALL_RATES[wall.type].name} (${wall.area} sq ft @ ₹${rate})</span>
                        <span style="color: #28a745;">₹${(rate * wall.area).toLocaleString()}</span>
                    </div>
                `;
            }
        });
    }
    if (!wallsHtml) {
        wallsHtml = '<p style="color: #999; font-style: italic;">No walls selected</p>';
    }
    document.getElementById('summaryWallsList').innerHTML = wallsHtml;
    document.getElementById('summaryWalls').textContent = `₹${STATE.totals.walls.toLocaleString()}`;
    
    // Flooring
    let floorHtml = '';
    if (STATE.floor.enabled && STATE.floor.type && STATE.layout) {
        floorHtml = `
            <div>Type: ${FLOOR_RATES[STATE.floor.type].name} (₹${FLOOR_RATES[STATE.floor.type].rate}/sq ft)</div>
            <div>Area: ${LAYOUTS[STATE.layout].area} sq ft</div>
            <div style="margin-top: 5px;">Cost: <strong>₹${STATE.totals.floor.toLocaleString()}</strong></div>
        `;
    } else {
        floorHtml = `<p style="color: #999; font-style: italic;">${STATE.floor.enabled ? 'Type not selected' : 'Flooring disabled'}</p>`;
    }
    document.getElementById('summaryFloorDetails').innerHTML = floorHtml;
    document.getElementById('summaryFloor').textContent = `₹${STATE.totals.floor.toLocaleString()}`;
    
    // Doors
    let doorsHtml = `
        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <span>Main Door: ${STATE.doors.main ? DOOR_RATES.main[STATE.doors.main].name : 'Not selected'}</span>
            <span style="color: #28a745;">₹${STATE.doors.main ? DOOR_RATES.main[STATE.doors.main].rate.toLocaleString() : 0}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <span>Internal Doors: ${STATE.doors.internal.type ? DOOR_RATES.internal[STATE.doors.internal.type].name : 'Not selected'} x ${STATE.doors.internal.count}</span>
            <span style="color: #28a745;">₹${(STATE.doors.internal.type && STATE.doors.internal.count > 0 ? DOOR_RATES.internal[STATE.doors.internal.type].rate * STATE.doors.internal.count : 0).toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <span>Handles: ${DOOR_RATES.handles[STATE.doors.handle].name}</span>
            <span style="color: #28a745;">${STATE.doors.handle !== 'standard' ? '₹' + (DOOR_RATES.handles[STATE.doors.handle].rate * STATE.doors.internal.count).toLocaleString() : 'Included'}</span>
        </div>
    `;
    document.getElementById('summaryDoorsDetails').innerHTML = doorsHtml;
    document.getElementById('summaryDoors').textContent = `₹${STATE.totals.doors.toLocaleString()}`;
    
    // Grand Total
    document.getElementById('summaryGrand').textContent = `₹${STATE.totals.grand.toLocaleString()}`;
}













// Recalculate all totals
function recalculateTotals() {
    // Electrical
    let electricalTotal = 0;
    Object.keys(STATE.electrical.items).forEach(key => {
        const item = STATE.electrical.items[key];
        if (item.selected && ELECTRICAL_ITEMS[key]) {
            electricalTotal += ELECTRICAL_ITEMS[key].rate * (item.qty || 1);
        }
    });
    STATE.totals.electrical = electricalTotal;
    
    // Woodwork
    let woodworkTotal = 0;
    
    // Kitchen
    if (STATE.woodwork.kitchen.quality && STATE.woodwork.kitchen.area > 0) {
        woodworkTotal += WOODWORK_RATES[STATE.woodwork.kitchen.quality] * STATE.woodwork.kitchen.area;
    }
    
    // Wardrobes
    STATE.woodwork.wardrobes.forEach(wardrobe => {
        if (wardrobe.quality && wardrobe.area > 0) {
            woodworkTotal += WOODWORK_RATES[wardrobe.quality] * wardrobe.area;
        }
    });
    
    STATE.totals.woodwork = woodworkTotal;
    
    // Bathroom
    STATE.totals.bathroom = STATE.bathroom ? BATHROOM_PACKAGES[STATE.bathroom].price : 0;
    
    // Walls
    let wallsTotal = 0;
    STATE.walls.forEach(wall => {
        if (wall.type && wall.area > 0) {
            wallsTotal += WALL_RATES[wall.type].rate * wall.area;
        }
    });
    STATE.totals.walls = wallsTotal;
    
    // Floor
    if (STATE.floor.enabled && STATE.floor.type && STATE.layout) {
        STATE.totals.floor = FLOOR_RATES[STATE.floor.type].rate * LAYOUTS[STATE.layout].area;
    } else {
        STATE.totals.floor = 0;
    }
    
    // Doors
    let doorsTotal = 0;
    
    // Main door
    if (STATE.doors.main) {
        doorsTotal += DOOR_RATES.main[STATE.doors.main].rate;
    }
    
    // Internal doors
    if (STATE.doors.internal.type && STATE.doors.internal.count > 0) {
        doorsTotal += DOOR_RATES.internal[STATE.doors.internal.type].rate * STATE.doors.internal.count;
    }
    
    // Handles
    if (STATE.doors.handle !== 'standard' && STATE.doors.internal.count > 0) {
        doorsTotal += DOOR_RATES.handles[STATE.doors.handle].rate * STATE.doors.internal.count;
    }
    
    STATE.totals.doors = doorsTotal;
    
    // Grand total
    STATE.totals.grand = 
        STATE.totals.electrical +
        STATE.totals.woodwork +
        STATE.totals.bathroom +
        STATE.totals.walls +
        STATE.totals.floor +
        STATE.totals.doors;
    
    // Update UI
    document.getElementById('grandTotal').textContent = `₹${STATE.totals.grand.toLocaleString()}`;
    updateCustomerDisplay();
    
    // Save state
    saveState();
}

// Check if customer details are complete
function isCustomerDetailsComplete() {
    return STATE.customer.name && 
           STATE.customer.email && 
           STATE.customer.phone && 
           STATE.customer.email.includes('@') && 
           STATE.customer.phone.length >= 10;
}

// Update button states (enable/disable)
function updateButtonStates() {
    const pdfBtn = document.getElementById('generatePDF');
    const emailBtn = document.getElementById('emailEstimate');
    const whatsappBtn = document.getElementById('whatsappEstimate');
    
    const isComplete = isCustomerDetailsComplete();
    
    if (isComplete) {
        pdfBtn.disabled = false;
        emailBtn.disabled = false;
        whatsappBtn.disabled = false;
        
        pdfBtn.style.opacity = '1';
        emailBtn.style.opacity = '1';
        whatsappBtn.style.opacity = '1';
        pdfBtn.style.cursor = 'pointer';
        emailBtn.style.cursor = 'pointer';
        whatsappBtn.style.cursor = 'pointer';
    } else {
        pdfBtn.disabled = true;
        emailBtn.disabled = true;
        whatsappBtn.disabled = true;
        
        pdfBtn.style.opacity = '0.5';
        emailBtn.style.opacity = '0.5';
        whatsappBtn.style.opacity = '0.5';
        pdfBtn.style.cursor = 'not-allowed';
        emailBtn.style.cursor = 'not-allowed';
        whatsappBtn.style.cursor = 'not-allowed';
    }
}

// Generate detailed message body with all selections
function generateMessageBody() {
    let body = 'TIAASH INTERIORS - DETAILED ESTIMATE\n';
    body += '='.repeat(50) + '\n\n';
    
    // Customer Details
    body += 'CUSTOMER DETAILS\n';
    body += '-'.repeat(30) + '\n';
    body += `Name: ${STATE.customer.name || 'Not provided'}\n`;
    if (STATE.customer.tower || STATE.customer.floor || STATE.customer.flat) {
        body += `Flat: ${STATE.customer.tower || ''} ${STATE.customer.floor || ''} ${STATE.customer.flat || ''}\n`.replace(/\s+/g, ' ');
    }
    body += `Email: ${STATE.customer.email || 'Not provided'}\n`;
    body += `Phone: ${STATE.customer.phone || 'Not provided'}\n\n`;
    
    // Layout
    body += 'LAYOUT\n';
    body += '-'.repeat(30) + '\n';
    body += `${STATE.layout ? LAYOUTS[STATE.layout].name + ' (' + LAYOUTS[STATE.layout].area + ' sq ft)' : 'Not selected'}\n\n`;
    
    // Electrical Items
    body += 'ELECTRICAL ITEMS\n';
    body += '-'.repeat(30) + '\n';
    let hasElectrical = false;
    Object.keys(STATE.electrical.items).forEach(key => {
        const item = STATE.electrical.items[key];
        if (item.selected && ELECTRICAL_ITEMS[key]) {
            hasElectrical = true;
            const rate = ELECTRICAL_ITEMS[key].rate;
            const qty = item.qty || 1;
            body += `${ELECTRICAL_ITEMS[key].name}: ${qty} x ₹${rate} = ₹${(rate * qty).toLocaleString()}\n`;
        }
    });
    if (!hasElectrical) body += 'No items selected\n';
    body += `Subtotal: ₹${STATE.totals.electrical.toLocaleString()}\n\n`;
    
    // Woodwork - Kitchen
    body += 'WOODWORK - KITCHEN\n';
    body += '-'.repeat(30) + '\n';
    if (STATE.woodwork.kitchen.quality && STATE.woodwork.kitchen.area > 0) {
        const rate = WOODWORK_RATES[STATE.woodwork.kitchen.quality];
        body += `Quality: ${STATE.woodwork.kitchen.quality}\n`;
        body += `Area: ${STATE.woodwork.kitchen.area} sq ft\n`;
        body += `Rate: ₹${rate}/sq ft\n`;
        body += `Cost: ₹${(rate * STATE.woodwork.kitchen.area).toLocaleString()}\n`;
    } else {
        body += 'Not selected\n';
    }
    
    // Woodwork - Wardrobes
    body += '\nWOODWORK - WARDROBES\n';
    body += '-'.repeat(30) + '\n';
    if (STATE.woodwork.wardrobes.length > 0) {
        STATE.woodwork.wardrobes.forEach((wardrobe, index) => {
            if (wardrobe.quality && wardrobe.area > 0) {
                const rate = WOODWORK_RATES[wardrobe.quality];
                body += `Wardrobe ${index + 1}: ${wardrobe.quality}, ${wardrobe.area} sq ft - ₹${(rate * wardrobe.area).toLocaleString()}\n`;
            }
        });
    } else {
        body += 'No wardrobes added\n';
    }
    body += `Woodwork Total: ₹${STATE.totals.woodwork.toLocaleString()}\n\n`;
    
    // Bathroom
    body += 'BATHROOM PACKAGE\n';
    body += '-'.repeat(30) + '\n';
    body += STATE.bathroom ? `${BATHROOM_PACKAGES[STATE.bathroom].name} - ₹${BATHROOM_PACKAGES[STATE.bathroom].price.toLocaleString()}\n` : 'Not selected\n';
    body += `Subtotal: ₹${STATE.totals.bathroom.toLocaleString()}\n\n`;
    
    // Walls
    body += 'WALL FINISHES\n';
    body += '-'.repeat(30) + '\n';
    if (STATE.walls.length > 0) {
        STATE.walls.forEach((wall, index) => {
            if (wall.type && wall.area > 0) {
                const rate = WALL_RATES[wall.type].rate;
                body += `Wall ${index + 1}: ${WALL_RATES[wall.type].name}, ${wall.area} sq ft - ₹${(rate * wall.area).toLocaleString()}\n`;
            }
        });
    } else {
        body += 'No walls selected\n';
    }
    body += `Walls Total: ₹${STATE.totals.walls.toLocaleString()}\n\n`;
    
    // Flooring
    body += 'FLOORING\n';
    body += '-'.repeat(30) + '\n';
    if (STATE.floor.enabled && STATE.floor.type && STATE.layout) {
        body += `${FLOOR_RATES[STATE.floor.type].name} - ₹${FLOOR_RATES[STATE.floor.type].rate}/sq ft\n`;
        body += `Area: ${LAYOUTS[STATE.layout].area} sq ft\n`;
    } else {
        body += STATE.floor.enabled ? 'Type not selected\n' : 'Flooring disabled\n';
    }
    body += `Flooring Total: ₹${STATE.totals.floor.toLocaleString()}\n\n`;
    
    // Doors
    body += 'DOORS\n';
    body += '-'.repeat(30) + '\n';
    body += `Main Door: ${STATE.doors.main ? DOOR_RATES.main[STATE.doors.main].name : 'Not selected'} - ₹${STATE.doors.main ? DOOR_RATES.main[STATE.doors.main].rate.toLocaleString() : 0}\n`;
    body += `Internal Doors: ${STATE.doors.internal.type ? DOOR_RATES.internal[STATE.doors.internal.type].name : 'Not selected'} x ${STATE.doors.internal.count} - ₹${(STATE.doors.internal.type && STATE.doors.internal.count > 0 ? DOOR_RATES.internal[STATE.doors.internal.type].rate * STATE.doors.internal.count : 0).toLocaleString()}\n`;
    body += `Handles: ${DOOR_RATES.handles[STATE.doors.handle].name}\n`;
    body += `Doors Total: ₹${STATE.totals.doors.toLocaleString()}\n\n`;
    
    // Grand Total
    body += '='.repeat(50) + '\n';
    body += `GRAND TOTAL: ₹${STATE.totals.grand.toLocaleString()}\n`;
    body += '='.repeat(50) + '\n\n';
    
    // Terms
    body += 'TERMS & CONDITIONS\n';
    body += '-'.repeat(30) + '\n';
    body += '• This is a preliminary estimate and subject to site visit\n';
    body += '• Prices valid for 30 days from the date of estimate\n';
    body += '• GST extra as applicable\n';
    body += '• Payment terms: 60% advance, 30% on material dispatch, 10% on completion\n';
    body += '• Installation timeline: 6-8 weeks post approval\n';
    body += '• Warranty: 1 year on workmanship, 5 years on modular products\n\n';
    
    body += `Generated on: ${new Date().toLocaleString()}\n`;
    body += 'Thank you for choosing Tiaash Interiors!';
    
    return body;
}

// Helper function for WhatsApp summary
function generateWhatsAppSummary() {
    let summary = '';
    
    // Add key items only (brief summary for WhatsApp)
    if (Object.values(STATE.electrical.items).some(i => i.selected)) {
        summary += '• Electrical items selected%0A';
    }
    if (STATE.woodwork.kitchen.quality && STATE.woodwork.kitchen.area > 0) {
        summary += '• Kitchen included%0A';
    }
    if (STATE.woodwork.wardrobes.length > 0) {
        summary += `• ${STATE.woodwork.wardrobes.length} wardrobe(s)%0A`;
    }
    if (STATE.bathroom) {
        summary += `• ${BATHROOM_PACKAGES[STATE.bathroom].name} bathroom%0A`;
    }
    if (STATE.walls.length > 0) {
        summary += `• ${STATE.walls.length} wall finish(es)%0A`;
    }
    if (STATE.floor.enabled && STATE.floor.type) {
        summary += `• ${FLOOR_RATES[STATE.floor.type].name} flooring%0A`;
    }
    
    return summary;
}








// Generate PDF - Optimized for smaller file size
document.getElementById('generatePDF').onclick = function() {
    // Check if customer details are complete
    if (!isCustomerDetailsComplete()) {
        alert('Please fill in all customer details (Name, Email, Phone) before downloading PDF.');
        goToStep(8);
        return;
    }
    
    // Create a clone for PDF generation
    const cloneContainer = document.createElement('div');
    cloneContainer.style.width = '800px';
    cloneContainer.style.padding = '30px';
    cloneContainer.style.background = 'white';
    cloneContainer.style.fontFamily = 'Arial, sans-serif';
    
    // Add header with customer details
    cloneContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #667eea; margin: 0;">Tiaash Interiors</h1>
            <h3 style="color: #666; margin: 5px 0;">Project Estimate</h3>
            <p style="color: #999;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <p><strong>Customer:</strong> ${STATE.customer.name || 'Not provided'}</p>
            ${STATE.customer.tower || STATE.customer.floor || STATE.customer.flat ? 
                `<p><strong>Flat:</strong> ${STATE.customer.tower || ''} ${STATE.customer.floor || ''} ${STATE.customer.flat || ''}</p>`.replace(/\s+/g, ' ') : ''}
            <p><strong>Email:</strong> ${STATE.customer.email || 'Not provided'}</p>
            <p><strong>Phone:</strong> ${STATE.customer.phone || 'Not provided'}</p>
        </div>
    `;
    
    // Layout
    cloneContainer.innerHTML += `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 5px;">Layout</h3>
            <p style="margin: 10px 0;">${STATE.layout ? LAYOUTS[STATE.layout].name + ' (' + LAYOUTS[STATE.layout].area + ' sq ft)' : 'Not selected'}</p>
        </div>
    `;
    
    // Electrical Items
    cloneContainer.innerHTML += `<h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 5px;">Electrical Items</h3>`;
    let hasElectrical = false;
    Object.keys(STATE.electrical.items).forEach(key => {
        const item = STATE.electrical.items[key];
        if (item.selected && ELECTRICAL_ITEMS[key]) {
            hasElectrical = true;
            const rate = ELECTRICAL_ITEMS[key].rate;
            const qty = item.qty || 1;
            cloneContainer.innerHTML += `
                <div style="display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px;">
                    <span>${ELECTRICAL_ITEMS[key].name} (${qty} x ₹${rate})</span>
                    <span style="color: #28a745;">₹${(rate * qty).toLocaleString()}</span>
                </div>
            `;
        }
    });
    if (!hasElectrical) {
        cloneContainer.innerHTML += `<p style="color: #999; font-style: italic;">No items selected</p>`;
    }
    cloneContainer.innerHTML += `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; margin-top: 5px; border-top: 1px dashed #ccc; font-weight: 500;">
            <span>Electrical Subtotal:</span>
            <span style="color: #28a745;">₹${STATE.totals.electrical.toLocaleString()}</span>
        </div>
    `;
    
    // Woodwork - Kitchen
    cloneContainer.innerHTML += `<h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 5px; margin-top: 20px;">Woodwork - Kitchen</h3>`;
    if (STATE.woodwork.kitchen.quality && STATE.woodwork.kitchen.area > 0) {
        const rate = WOODWORK_RATES[STATE.woodwork.kitchen.quality];
        cloneContainer.innerHTML += `
            <div style="padding: 5px 0;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Quality: ${STATE.woodwork.kitchen.quality}</span>
                    <span>₹${rate}/sq ft</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Area: ${STATE.woodwork.kitchen.area} sq ft</span>
                    <span style="color: #28a745;">₹${(rate * STATE.woodwork.kitchen.area).toLocaleString()}</span>
                </div>
            </div>
        `;
    } else {
        cloneContainer.innerHTML += `<p style="color: #999; font-style: italic;">Not selected</p>`;
    }
    
    // Woodwork - Wardrobes
    cloneContainer.innerHTML += `<h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 5px; margin-top: 15px;">Woodwork - Wardrobes</h3>`;
    if (STATE.woodwork.wardrobes.length > 0) {
        STATE.woodwork.wardrobes.forEach((wardrobe, index) => {
            if (wardrobe.quality && wardrobe.area > 0) {
                const rate = WOODWORK_RATES[wardrobe.quality];
                cloneContainer.innerHTML += `
                    <div style="padding: 5px 0;">
                        <div style="font-weight: 500;">Wardrobe ${index + 1}</div>
                        <div style="display: flex; justify-content: space-between; padding-left: 10px;">
                            <span>${wardrobe.quality} (${wardrobe.area} sq ft @ ₹${rate})</span>
                            <span style="color: #28a745;">₹${(rate * wardrobe.area).toLocaleString()}</span>
                        </div>
                    </div>
                `;
            }
        });
    } else {
        cloneContainer.innerHTML += `<p style="color: #999; font-style: italic;">No wardrobes added</p>`;
    }
    cloneContainer.innerHTML += `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; margin-top: 5px; border-top: 1px dashed #ccc; font-weight: 500;">
            <span>Woodwork Total:</span>
            <span style="color: #28a745;">₹${STATE.totals.woodwork.toLocaleString()}</span>
        </div>
    `;
    
    // Bathroom
    cloneContainer.innerHTML += `<h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 5px; margin-top: 20px;">Bathroom Package</h3>`;
    if (STATE.bathroom) {
        cloneContainer.innerHTML += `
            <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                <span>${BATHROOM_PACKAGES[STATE.bathroom].name}</span>
                <span style="color: #28a745;">₹${BATHROOM_PACKAGES[STATE.bathroom].price.toLocaleString()}</span>
            </div>
        `;
    } else {
        cloneContainer.innerHTML += `<p style="color: #999; font-style: italic;">Not selected</p>`;
    }
    
    // Walls
    cloneContainer.innerHTML += `<h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 5px; margin-top: 20px;">Wall Finishes</h3>`;
    if (STATE.walls.length > 0) {
        STATE.walls.forEach((wall, index) => {
            if (wall.type && wall.area > 0) {
                const rate = WALL_RATES[wall.type].rate;
                cloneContainer.innerHTML += `
                    <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                        <span>Wall ${index + 1}: ${WALL_RATES[wall.type].name} (${wall.area} sq ft @ ₹${rate})</span>
                        <span style="color: #28a745;">₹${(rate * wall.area).toLocaleString()}</span>
                    </div>
                `;
            }
        });
    } else {
        cloneContainer.innerHTML += `<p style="color: #999; font-style: italic;">No walls selected</p>`;
    }
    cloneContainer.innerHTML += `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; margin-top: 5px; border-top: 1px dashed #ccc; font-weight: 500;">
            <span>Walls Total:</span>
            <span style="color: #28a745;">₹${STATE.totals.walls.toLocaleString()}</span>
        </div>
    `;
    
    // Flooring
    cloneContainer.innerHTML += `<h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 5px; margin-top: 20px;">Flooring</h3>`;
    if (STATE.floor.enabled && STATE.floor.type && STATE.layout) {
        cloneContainer.innerHTML += `
            <div style="padding: 5px 0;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Type: ${FLOOR_RATES[STATE.floor.type].name}</span>
                    <span>₹${FLOOR_RATES[STATE.floor.type].rate}/sq ft</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Area: ${LAYOUTS[STATE.layout].area} sq ft</span>
                    <span style="color: #28a745;">₹${STATE.totals.floor.toLocaleString()}</span>
                </div>
            </div>
        `;
    } else {
        cloneContainer.innerHTML += `<p style="color: #999; font-style: italic;">${STATE.floor.enabled ? 'Type not selected' : 'Flooring disabled'}</p>`;
    }
    
    // Doors
    cloneContainer.innerHTML += `<h3 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 5px; margin-top: 20px;">Doors</h3>`;
    cloneContainer.innerHTML += `
        <div style="padding: 5px 0;">
            <div style="display: flex; justify-content: space-between;">
                <span>Main Door: ${STATE.doors.main ? DOOR_RATES.main[STATE.doors.main].name : 'Not selected'}</span>
                <span style="color: #28a745;">₹${STATE.doors.main ? DOOR_RATES.main[STATE.doors.main].rate.toLocaleString() : 0}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                <span>Internal Doors: ${STATE.doors.internal.type ? DOOR_RATES.internal[STATE.doors.internal.type].name : 'Not selected'} x ${STATE.doors.internal.count}</span>
                <span style="color: #28a745;">₹${(STATE.doors.internal.type && STATE.doors.internal.count > 0 ? DOOR_RATES.internal[STATE.doors.internal.type].rate * STATE.doors.internal.count : 0).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                <span>Handles: ${DOOR_RATES.handles[STATE.doors.handle].name}</span>
                <span style="color: #28a745;">${STATE.doors.handle !== 'standard' ? '₹' + (DOOR_RATES.handles[STATE.doors.handle].rate * STATE.doors.internal.count).toLocaleString() : 'Included'}</span>
            </div>
        </div>
    `;
    cloneContainer.innerHTML += `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; margin-top: 5px; border-top: 1px dashed #ccc; font-weight: 500;">
            <span>Doors Total:</span>
            <span style="color: #28a745;">₹${STATE.totals.doors.toLocaleString()}</span>
        </div>
    `;
    
    // Grand Total
    cloneContainer.innerHTML += `
        <div style="display: flex; justify-content: space-between; padding: 15px 0; margin-top: 20px; border-top: 3px solid #333; font-size: 20px; font-weight: bold;">
            <span>GRAND TOTAL:</span>
            <span style="color: #28a745;">₹${STATE.totals.grand.toLocaleString()}</span>
        </div>
    `;
    
    // Terms and Conditions
    cloneContainer.innerHTML += `
        <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 10px; color: #666;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Terms & Conditions</h4>
            <ul style="margin: 0; padding-left: 20px;">
                <li>This is a preliminary estimate and subject to site visit</li>
                <li>Prices valid for 30 days from the date of estimate</li>
                <li>GST extra as applicable</li>
                <li>Payment terms: 60% advance, 30% on material dispatch, 10% on completion</li>
                <li>Installation timeline: 6-8 weeks post approval</li>
                <li>Warranty: 1 year on workmanship, 5 years on modular products</li>
                <li>Any changes in layout or design may affect final pricing</li>
            </ul>
            <div style="margin-top: 10px; font-weight: 500; color: #dc3545; text-align: center;">
                * This is a computer generated estimate - valid with customer signature
            </div>
        </div>
        <div style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>Thank you for choosing Tiaash Interiors</p>
        </div>
    `;
    
    // Add to body and generate PDF with optimized settings
    document.body.appendChild(cloneContainer);
    
    html2canvas(cloneContainer, {
        scale: 1.5,  // Reduced from 2 to 1.5 for smaller file size
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 800,
        allowTaint: true,
        useCORS: true,
        imageTimeout: 0,
        removeContainer: true,
        pixelRatio: 1.5  // Reduced from 2 to 1.5
    }).then(canvas => {
        // Compress the canvas image
        const imgData = canvas.toDataURL('image/jpeg', 0.7);  // JPEG at 70% quality instead of PNG
        
        // Create PDF with custom dimensions to fit content
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width + 40, canvas.height + 40]
        });
        
        pdf.addImage(imgData, 'JPEG', 20, 20, canvas.width, canvas.height, undefined, 'FAST');
        pdf.save(`landmark-estimate-${Date.now()}.pdf`);
        
        // Remove the clone
        document.body.removeChild(cloneContainer);
    }).catch(error => {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF. Please try again.');
        if (document.body.contains(cloneContainer)) {
            document.body.removeChild(cloneContainer);
        }
    });
};











// Email estimate with validation
document.getElementById('emailEstimate').onclick = function() {
    if (!isCustomerDetailsComplete()) {
        alert('Please fill in all customer details (Name, Email, Phone) before sending email.');
        goToStep(8);
        return;
    }
    const subject = 'Tiaash Interiors Estimate';
    const body = generateMessageBody();
    
    window.location.href = `mailto:ssb@tiaash.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

// WhatsApp estimate with validation
document.getElementById('whatsappEstimate').onclick = function() {
    if (!isCustomerDetailsComplete()) {
        alert('Please fill in all customer details (Name, Email, Phone) before sending WhatsApp message.');
        goToStep(8);
        return;
    }
    
    // Create detailed WhatsApp message
    const customerInfo = `Customer: ${STATE.customer.name} | ${STATE.customer.phone}`;
    const flatInfo = STATE.customer.tower || STATE.customer.floor || STATE.customer.flat ? 
        `Flat: ${STATE.customer.tower || ''} ${STATE.customer.floor || ''} ${STATE.customer.flat || ''}`.replace(/\s+/g, ' ') : '';
    
    const message = `Hello Tiaash Interiors,%0A%0A${customerInfo}%0A${flatInfo}%0A%0ALayout: ${STATE.layout ? LAYOUTS[STATE.layout].name : 'Not selected'}%0A%0ADetailed Estimate:%0A${generateWhatsAppSummary()}%0A%0ATotal Estimate: ₹${STATE.totals.grand.toLocaleString()}%0A%0APlease review the detailed estimate.`;
    
    window.open(`https://wa.me/918796446427/?text=${message}`, '_blank');
};

// Initialize sidebar
function initSidebar() {
    const sidebar = document.querySelector('.steps');
    sidebar.innerHTML = '';
    
    STEPS.forEach(step => {
        const item = document.createElement('div');
        item.className = 'step-item';
        item.textContent = step.name;
        item.onclick = () => goToStep(step.id);
        sidebar.appendChild(item);
    });
}

// Add event listeners for add buttons
document.getElementById('addWardrobe').onclick = window.addWardrobe;
document.getElementById('addWall').onclick = window.addWall;

// Initialize app
function init() {
    loadState();
    initSidebar();
    // updateProgressBar(1); // Disabled - using sidebar only
    goToStep(1);
    recalculateTotals();
    updateButtonStates();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
