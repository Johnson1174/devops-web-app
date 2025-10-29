let userId = localStorage.getItem('userId');
let userName = localStorage.getItem('userName');

// Session check: redirect to login if not logged in
if (!userId && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
  window.location.href = '/login';
}

// Update header with user name and logout if logged in
if (userName) {
  const nav = document.querySelector('nav');
  if (nav) {
    nav.innerHTML += `<span>Welcome, ${userName}</span> <a href="/orders">Orders</a> <a href="#" id="logout-link">Logout</a>`;
  }
}

// Update cart count
function updateCartCount() {
  if (userId) {
    fetch(`/cart/${userId}`)
      .then(res => res.json())
      .then(items => {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
          cartCount.textContent = items.length;
        }
      });
  }
}

// Call updateCartCount on page load
updateCartCount();

// Logout handler
document.addEventListener('click', function(e) {
  if (e.target.id === 'logout-link') {
    e.preventDefault();
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.location.href = '/login';
  }
});

// Category click
document.addEventListener('click', function(e) {
  if (e.target.closest('.category')) {
    const category = e.target.closest('.category').dataset.category;
    window.location.href = `/category/${encodeURIComponent(category)}`;
  }
});

// Add to cart
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('add-to-cart')) {
    if (!userId) {
      alert('Please login first');
      window.location.href = '/login';
      return;
    }
    const item = e.target;
    const itemData = {
      id: item.dataset.id,
      name: item.dataset.name,
      price: parseFloat(item.dataset.price),
      type: item.dataset.type || 'N/A',
      brand: item.dataset.brand || 'N/A'
    };
    fetch('/add-to-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, item: itemData })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        alert('Item added to cart');
        updateCartCount();
      }
    });
  }
});

// Login
if (document.getElementById('login-form')) {
  document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', data.name);
        window.location.href = '/';
      } else {
        alert(data.message);
      }
    });
  });
}

// Signup
if (document.getElementById('signup-form')) {
  document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, password })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', name);
        window.location.href = '/';
      } else {
        alert(data.message);
      }
    });
  });
}

// Cart
if (document.getElementById('cart-items')) {
  userId = localStorage.getItem('userId');
  if (!userId) {
    window.location.href = '/login';
  } else {
    fetch(`/cart/${userId}`).then(res => res.json()).then(items => {
      const cartSection = document.getElementById('cart-items');
      let total = 0;
      if (items.length === 0) {
        cartSection.innerHTML = '<p>Your cart is empty</p>';
      } else {
        items.forEach((item, index) => {
          total += item.price;
          cartSection.innerHTML += `
            <div class="cart-item">
              <img src="https://via.placeholder.com/100x75" alt="${item.name}" style="float: left; margin-right: 1rem;">
              <h3>${item.name}</h3>
              <p>Type: ${item.type || 'N/A'}</p>
              <p>Brand: ${item.brand || 'N/A'}</p>
              <p>$${item.price}</p>
              <button onclick="removeFromCart(${index})" style="background-color: #dc3545; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">Remove</button>
            </div>
          `;
        });
        cartSection.innerHTML += `<div class="cart-total">Total: $${total.toFixed(2)}</div>`;
      }
    });
  }
}

// Remove from cart
function removeFromCart(index) {
  if (confirm('Remove this item from cart?')) {
    fetch(`/cart/${userId}`)
      .then(res => res.json())
      .then(items => {
        items.splice(index, 1);
        // Update cart in server (simplified - in real app, you'd have a remove endpoint)
        fetch('/update-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, items })
        }).then(() => {
          location.reload();
        });
      });
  }
}

// Checkout
if (document.getElementById('checkout-form')) {
  document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const deliveryDate = document.getElementById('delivery-date').value;
    const address = document.getElementById('address').value;
    const paymentInfo = document.getElementById('payment-info').value;
    fetch('/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, deliveryDate, address, paymentInfo })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        window.location.href = '/thank-you';
      } else {
        alert(data.message);
      }
    });
  });
}

// Load category products
if (document.getElementById('product-list')) {
  const category = window.location.pathname.split('/').pop();
  const categoryName = decodeURIComponent(category);
  document.getElementById('category-name').textContent = categoryName;
  document.title = `${categoryName} - BuildMart`;

  // Set category-specific descriptions
  const descriptions = {
    'Cement & Concrete': 'High-quality cement and concrete products from top brands like UltraTech, Ambuja, ACC, and JK White.',
    'Bricks & Blocks': 'Durable bricks and blocks including clay bricks, concrete blocks, fly ash bricks, and AAC blocks.',
    'Sand & Aggregates': 'Premium sand and aggregates including M-Sand, P-Sand, gravel, and stone dust.',
    'Pipes & Fittings': 'Complete plumbing solutions with PVC pipes, GI pipes, and fittings from brands like Supreme, Finolex, and Ashirvad.',
    'Steel & Metals': 'Strong steel and metal products including rebars and angle iron from Tata Steel, JSW Steel, and Sail.',
    'Electrical': 'Electrical supplies including wires, switches, and sockets from Havells, Polycab, and Legrand.'
  };

  const descriptionElement = document.getElementById('category-description');
  if (descriptionElement) {
    descriptionElement.textContent = descriptions[categoryName] || 'Your one-stop shop for all building materials. Quality products at competitive prices with fast delivery!';
  }

  // Set category-specific price information
  const priceInfos = {
    'Cement & Concrete': '<h3>Price Information</h3><ul><li>Cement (50 kg bag): Approx. ₹ 350–₹ 500 per bag.</li></ul>',
    'Bricks & Blocks': '<h3>Price Information</h3><ul><li>Price varies significantly by type (clay, AAC, fly-ash) — please enquire for current rates.</li></ul>',
    'Sand & Aggregates': '<h3>Price Information</h3><ul><li>Price depends on location, volume and grade (M-Sand, P-Sand, gravel) — request quote.</li></ul>',
    'Pipes & Fittings': '<h3>Price Information</h3><ul><li>PVC/CPVC/GI/HDPE sizes & wall-thickness vary — please refer to our latest catalogue or request pricing.</li></ul>',
    'Steel & Metals': '<h3>Price Information</h3><ul><li>Steel & Metals (TMT/Rebar): From approx. ₹ 52 per kg (for standard sizes) up to ₹ 70,000+ per tonne depending on grade and diameter.</li></ul>',
    'Electrical': '<h3>Price Information</h3><ul><li>Wires, conduits, switchgear — pricing dependent on brand, gauge and specification — please contact for latest list.</li></ul>'
  };

  const priceInfoElement = document.getElementById('price-info');
  if (priceInfoElement) {
    priceInfoElement.innerHTML = priceInfos[categoryName] || '';
  }

  // Set category-specific types, brands, and uses
  const categoryDetails = {
    'Cement & Concrete': {
      emoji: '🧱',
      number: '1. Cement & Concrete',
      types: [
        'Ordinary Portland Cement (OPC 33/43/53 Grade) – General construction.',
        'Portland Pozzolana Cement (PPC) – Environment-friendly, long-lasting.',
        'Portland Slag Cement (PSC) – Resistant to chemical attack.',
        'White Cement – Decorative and finishing work.',
        'Ready-Mix Concrete (RMC) – Pre-mixed concrete for large-scale use.'
      ],
      brands: [
        'UltraTech Cement – India\'s largest manufacturer, offers OPC, PPC, RMC.',
        'ACC Cement – Known for consistent quality and eco-friendly blends.',
        'Ambuja Cement – Specializes in water-resistant and PPC blends.',
        'Dalmia Cement – Focused on green cement and PSC.',
        'Shree Cement – Offers high-strength and sustainable options.'
      ],
      uses: 'Used in foundations, slabs, beams, bridges, pavements, and decorative architecture.',
      priceRanges: [
        'Cement (50 kg bag): ~ ₹ 350 – ₹ 500 per bag.'
      ],
      products: [
        { name: 'UltraTech Cement 50kg', price: '₹ 400', image: 'https://via.placeholder.com/200x150?text=Cement' },
        { name: 'ACC Cement 50kg', price: '₹ 380', image: 'https://via.placeholder.com/200x150?text=Cement' },
        { name: 'Ambuja Cement 50kg', price: '₹ 390', image: 'https://via.placeholder.com/200x150?text=Cement' }
      ]
    },
    'Bricks & Blocks': {
      emoji: '🧱',
      number: '2. Bricks & Blocks',
      types: [
        'Clay Bricks – Traditional, kiln-fired.',
        'Fly Ash Bricks – Eco-friendly, made from fly ash.',
        'Concrete Blocks (Hollow/Solid) – Lightweight and strong.',
        'AAC Blocks (Autoclaved Aerated Concrete) – Thermal insulation and energy-efficient.',
        'CSEB (Compressed Stabilized Earth Blocks) – Low-carbon local material.'
      ],
      brands: [
        'Magicrete Building Solutions – Leading AAC block producer.',
        'Siporex India – Known for AAC lightweight blocks.',
        'Birla Aerocon – Offers eco-friendly, thermally efficient blocks.',
        'Nuvoco Vistas – Fly ash and concrete block solutions.',
        'JK Lakshmi Smart Blocks – Premium-grade AAC and concrete blocks.'
      ],
      uses: 'Wall construction, load-bearing structures, partition walls, and insulation.',
      priceRanges: [
        'Bricks & Blocks: (Less precise public data) — you may list “Contact for pricing” or “Depends on type (clay / AAC / fly-ash)”'
      ],
      products: [
        { name: 'Red Clay Bricks (1000 pcs)', price: 'Contact for pricing', image: 'https://via.placeholder.com/200x150?text=Bricks' },
        { name: 'Concrete Blocks', price: 'Contact for pricing', image: 'https://via.placeholder.com/200x150?text=Blocks' },
        { name: 'AAC Blocks', price: 'Contact for pricing', image: 'https://via.placeholder.com/200x150?text=AAC' }
      ]
    },
    'Sand & Aggregates': {
      emoji: '🏖️',
      number: '3. Sand & Aggregates',
      types: [
        'M-Sand (Manufactured Sand) – Replacement for river sand.',
        'P-Sand (Plastering Sand) – Finer grade for plastering.',
        'River Sand – Natural sand (limited use due to mining bans).',
        'Gravel / Crushed Stone Aggregates – Used in concrete mixes.',
        'Stone Dust / Quarry Dust – Used as filler and sub-base.'
      ],
      brands: [
        'Robo Silicon Pvt. Ltd. – Pioneer of manufactured sand in India.',
        'Tirupati Rocks Pvt. Ltd. – Major aggregate supplier.',
        'CDE Asia – M-Sand washing & processing technology.',
        'L&T Aggregates – Industrial-scale production.',
        'The Delta Group – Produces M-Sand and crushed stone.'
      ],
      uses: 'Concrete mixing, plastering, filling, and road base layers.',
      priceRanges: [
        'Sand & Aggregates: (Typically quoted per m³ or ton) — you may list “Depends on project size and region; contact for quote”'
      ],
      products: [
        { name: 'M-Sand 1 Ton', price: 'Request quote', image: 'https://via.placeholder.com/200x150?text=Sand' },
        { name: 'P-Sand 1 Ton', price: 'Request quote', image: 'https://via.placeholder.com/200x150?text=Sand' },
        { name: 'Gravel 20mm 1 Ton', price: 'Request quote', image: 'https://via.placeholder.com/200x150?text=Gravel' }
      ]
    },
    'Pipes & Fittings': {
      emoji: '🚰',
      number: '4. Pipes & Fittings',
      types: [
        'PVC Pipes – Lightweight plumbing and drainage.',
        'CPVC Pipes – Hot/cold water systems.',
        'GI Pipes – Water supply and external networks.',
        'HDPE Pipes – Agricultural, sewage, and gas networks.',
        'UPVC Electrical Conduits – For wire protection.'
      ],
      brands: [
        'Supreme Industries – India\'s largest plastic pipe manufacturer.',
        'Finolex Industries – Known for PVC and CPVC products.',
        'Astral Pipes – Premium CPVC and drainage systems.',
        'Ashirvad Pipes – High-performance plumbing and fittings.',
        'Prince Pipes and Fittings – Offers HDPE, UPVC, and CPVC.'
      ],
      uses: 'Water supply, sanitation, irrigation, industrial piping, and electrical conduits.',
      priceRanges: [
        'Pipes & Fittings: (Depends on diameter, material) — e.g., PVC pipe might run “₹ … per metre” — include “Contact for current rates”'
      ],
      products: [
        { name: 'PVC Pipes 4 inch', price: 'Refer to catalogue', image: 'https://via.placeholder.com/200x150?text=Pipes' },
        { name: 'GI Pipes 2 inch', price: 'Refer to catalogue', image: 'https://via.placeholder.com/200x150?text=Pipes' },
        { name: 'HDPE Pipes 3 inch', price: 'Refer to catalogue', image: 'https://via.placeholder.com/200x150?text=Pipes' }
      ]
    },
    'Steel & Metals': {
      emoji: '⚙️',
      number: '5. Steel & Metals',
      types: [
        'TMT Bars (Thermo-Mechanically Treated) – Reinforcement for concrete.',
        'Angle Iron & Channels – Used in fabrication and framing.',
        'Structural Steel (I/H Beams, Girders) – Large infrastructure.',
        'Mild Steel Sheets & Rods – General construction.',
        'Stainless Steel – Architectural and industrial uses.'
      ],
      brands: [
        'TATA Steel – Renowned for TMT and structural steel.',
        'JSW Steel – High-quality TMT and galvanized products.',
        'SAIL (Steel Authority of India) – Government steel producer.',
        'Jindal Steel & Power Ltd. – Major supplier for heavy construction.',
        'Vizag Steel (RINL) – Strong rebar and structural steel range.'
      ],
      uses: 'Reinforcement, bridges, high-rise buildings, and industrial frameworks.',
      priceRanges: [
        'Steel & Metals: (Per kg or tonne) — e.g., TMT bars “₹ 52–70 per kg” depending on grade'
      ],
      products: [
        { name: 'Steel Rebars 12mm', price: '₹ 52 per kg', image: 'https://via.placeholder.com/200x150?text=Steel' },
        { name: 'Angle Iron 50x50mm', price: '₹ 60 per kg', image: 'https://via.placeholder.com/200x150?text=Steel' },
        { name: 'TMT Bars 16mm', price: '₹ 55 per kg', image: 'https://via.placeholder.com/200x150?text=Steel' }
      ]
    },
    'Electrical': {
      emoji: '⚡',
      number: '6. Electrical Materials',
      types: [
        'Cables & Wires – Copper/aluminum electrical conductors.',
        'Switches & Sockets – Control and distribution devices.',
        'Conduits & Fittings – Wire protection.',
        'Circuit Breakers & MCBs – Safety from overload and faults.',
        'Panels & Lighting Systems – Power management and illumination.'
      ],
      brands: [
        'Havells India – Comprehensive electrical solutions.',
        'Anchor by Panasonic – Switchgear and wiring devices.',
        'Polycab Wires – Leading wire and cable manufacturer.',
        'Finolex Cables – Residential and industrial wiring.',
        'Legrand India – Premium automation and electrical fittings.'
      ],
      uses: 'Residential, commercial, and industrial electrical infrastructure.',
      priceRanges: [
        'Electrical: (Depends on gauge, brand, type) — e.g., wires “₹ … per metre” — contact for pricing'
      ],
      products: [
        { name: 'Electrical Wires 1.5mm', price: 'Contact for latest list', image: 'https://via.placeholder.com/200x150?text=Wires' },
        { name: 'Switches & Sockets', price: 'Contact for latest list', image: 'https://via.placeholder.com/200x150?text=Switches' },
        { name: 'Circuit Breakers', price: 'Contact for latest list', image: 'https://via.placeholder.com/200x150?text=Breakers' }
      ]
    }
  };

  const details = categoryDetails[categoryName];
  if (details) {
    const emojiElement = document.getElementById('category-emoji');
    const numberElement = document.getElementById('category-number');
    const typesList = document.getElementById('types-list');
    const brandsList = document.getElementById('brands-list');
    const usesText = document.getElementById('uses-text');
    const productsList = document.getElementById('products-list');

    if (emojiElement) {
      emojiElement.textContent = details.emoji;
    }

    if (numberElement) {
      numberElement.textContent = details.number;
    }

    if (typesList) {
      details.types.forEach(type => {
        const li = document.createElement('li');
        li.textContent = type;
        typesList.appendChild(li);
      });
    }

    if (brandsList) {
      details.brands.forEach(brand => {
        const li = document.createElement('li');
        li.textContent = brand;
        brandsList.appendChild(li);
      });
    }

    if (usesText) {
      usesText.textContent = details.uses;
    }

    if (productsList) {
      details.products.forEach((product, index) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'sample-product';
        productDiv.innerHTML = `
          <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 75px;">
          <h4>${product.name}</h4>
          <p>Price: ${product.price}</p>
          <button class="add-to-cart" data-id="${100 + index}" data-name="${product.name}" data-price="${product.price === '₹ 52 per kg' ? 52 : product.price === '₹ 60 per kg' ? 60 : product.price === '₹ 55 per kg' ? 55 : product.price === '₹ 400' ? 400 : product.price === '₹ 380' ? 380 : product.price === '₹ 390' ? 390 : 0}">Add to Cart</button>
        `;
        productsList.appendChild(productDiv);
      });
    }
  }

  // Load types for filtering
  fetch(`/api/category/${encodeURIComponent(category)}/types`)
    .then(res => res.json())
    .then(types => {
      const typeFilters = document.getElementById('type-filters');
      if (typeFilters) {
        typeFilters.innerHTML = '<button class="type-filter active" data-type="all">All Types</button>';
        types.forEach(type => {
          typeFilters.innerHTML += `<button class="type-filter" data-type="${type}">${type}</button>`;
        });
      }
    });

  // Function to load products
  function loadProducts(type = 'all') {
    const url = type === 'all' ? `/api/category/${encodeURIComponent(category)}` : `/api/category/${encodeURIComponent(category)}/${encodeURIComponent(type)}`;
    fetch(url)
      .then(res => res.json())
      .then(products => {
        const list = document.getElementById('product-list');
        const title = document.getElementById('product-section-title');
        if (list) {
          list.innerHTML = '';
          if (products.length === 0) {
            list.innerHTML = '<p>No products found for this type.</p>';
          } else {
            products.forEach(product => {
              list.innerHTML += `
                <div class="product-item">
                  <img src="${product.image}" alt="${product.name}" class="product-image">
                  <div class="product-details">
                    <h3>${product.name}</h3>
                    <p><strong>Type:</strong> ${product.type}</p>
                    <p><strong>Brand:</strong> ${product.brand}</p>
                    <p class="price"><strong>Price:</strong> $${product.price}</p>
                    <button class="add-to-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
                  </div>
                </div>
              `;
            });
          }
        }
        if (title) {
          title.textContent = type === 'all' ? 'Available Products' : `${type} Products`;
        }
      });
  }

  // Load all products initially
  loadProducts();

  // Type filter click handler
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('type-filter')) {
      // Remove active class from all filters
      document.querySelectorAll('.type-filter').forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked filter
      e.target.classList.add('active');
      // Load products for selected type
      const type = e.target.dataset.type;
      loadProducts(type);
    }
  });
}
