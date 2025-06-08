    // Enhanced resort data with search criteria
    const resorts = {
      lagunaHotSpring: {
        name: "Laguna Hot Spring Resort",
        address: "Pansol, Calamba, Laguna",
        description: "A popular resort featuring natural hot spring pools and accommodations for families and groups.",
        facilities: "Swimming pools, Hot spring baths, Cottages, Function halls, Restaurant, Parking",
        lat: 14.179855690866304,
        lng: 121.1837820447193,
        website: "/RESORTS/01_resort.html",
        // Search criteria
        bedrooms: 3,
        price: "mid", // ₱7,500 per night
        amenities: ["hot-spring", "parking", "kitchen", "wifi"],
        priceValue: "₱7,500 per night"
      },
      villaMejia: {
        name: "Villa Mejia",
        address: "Pansol, Calamba, Laguna",
        description: "A private resort with swimming pools and complete facilities for events and gatherings.",
        facilities: "Private pools, Event space, Kitchen facilities, Barbecue area, Air-conditioned rooms",
        lat: 14.179350807676604,
        lng: 121.18485773727306,
        website: "2_RESORT.html",
        // Search criteria
        bedrooms: 4,
        price: "premium", // ₱12,000 per night
        amenities: ["aircon", "kitchen", "parking"],
        priceValue: "₱12,000 per night"
      },
      glennettesHaven: {
        name: "Glennette's Haven Private Resort",
        address: "Pansol, Calamba, Laguna",
        description: "An exclusive private resort with hot spring pools perfect for family outings and celebrations.",
        facilities: "Hot spring pools, Karaoke, Videoke, Outdoor grilling area, WiFi",
        lat: 14.179889853295485,
        lng: 121.1861350014737,
        website: "3_RESORT.html",
        // Search criteria
        bedrooms: 2,
        price: "budget", // ₱4,500 per night
        amenities: ["hot-spring", "karaoke", "wifi"],
        priceValue: "₱4,500 per night"
      },
      elysianSourire: {
        name: "Elysian Sourire Resort",
        address: "Pansol, Calamba, Laguna",
        description: "A tranquil resort offering relaxing hot spring pools and modern amenities.",
        facilities: "Heated pools, Spa services, Gazebo, Garden area, Outdoor dining",
        lat: 14.17950049393675,
        lng: 121.18694386655233,
        website: "4_RESORT.html",
        // Search criteria
        bedrooms: 5,
        price: "premium", // ₱15,000 per night
        amenities: ["hot-spring", "wifi", "aircon", "parking"],
        priceValue: "₱15,000 per night"
      },
      villaFrancesca: {
        name: "Villa Francesca Private Resort - Pansol",
        address: "Pansol, Calamba, Laguna",
        description: "A spacious private resort ideal for large groups and events with multiple pools.",
        facilities: "Multiple swimming pools, Function hall, Videoke, Cottages, Playground",
        lat: 14.180012234621406,
        lng: 121.1871543967939,
        website: "5_RESORT.html",
        // Search criteria
        bedrooms: 6,
        price: "premium", // ₱18,000 per night
        amenities: ["karaoke", "aircon", "kitchen", "parking"],
        priceValue: "₱18,000 per night"
      }
    };
    
    // Map initialization
    let map;
    let markers = {};
    let activeMarker = null;
    let filteredResorts = {};
    let userLocation = null;
    let userMarker = null;
    let routingControl = null;
    let activeResortId = null;
    
    // Initialize map using Leaflet
    function initMap() {
      // Create map centered on Laguna resorts area
      map = L.map('map', {
        zoomControl: false
      }).setView([14.1799, 121.1855], 16);
      
      // Add custom zoom control in the right bottom corner
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map);
      
      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);
      
      // Custom marker icon for resorts
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
          <path fill="#3498db" d="M12 0c-4.4 0-8 3.6-8 8 0 5.4 7 13.4 7.3 13.7.2.2.5.3.7.3s.5-.1.7-.3c.3-.3 7.3-8.3 7.3-13.7 0-4.4-3.6-8-8-8zm0 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
        </svg>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });
      
      // Add markers for each resort
      for (const [id, resort] of Object.entries(resorts)) {
        const marker = L.marker([resort.lat, resort.lng], {
          title: resort.name,
          icon: customIcon
        }).addTo(map);
        
        markers[id] = marker;
        
        // Add click event for markers
        marker.on('click', function() {
          showResortInfo(id);
          highlightMarker(id);
          activeResortId = id;
        });
      }
      
      // Initialize the resort list
      populateResortList(resorts);
    }
    
    // Get user's current location with improved feedback
    function getCurrentLocation() {
      const statusEl = document.getElementById('location-status');
      const locationBtn = document.getElementById('location-btn');
      
      if (!navigator.geolocation) {
        showLocationStatus('Geolocation not supported by this browser', 'error');
        return;
      }
      
      // Show loading state
      locationBtn.classList.add('loading');
      showLocationStatus('Getting your location...', 'loading');
      
      navigator.geolocation.getCurrentPosition(
        function(position) {
          userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Remove existing user marker if any
          if (userMarker) {
            map.removeLayer(userMarker);
          }
          
          // Create user location marker
          const userIcon = L.divIcon({
            className: 'user-marker',
            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
              <circle fill="#27ae60" cx="12" cy="12" r="8"/>
              <circle fill="white" cx="12" cy="12" r="3"/>
            </svg>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          userMarker = L.marker([userLocation.lat, userLocation.lng], {
            icon: userIcon,
            title: 'Your Location'
          }).addTo(map);
          
          // Update button state
          locationBtn.classList.remove('loading');
          showLocationStatus('Location found successfully!', 'success');
          
          // Hide status after 3 seconds
          setTimeout(() => {
            hideLocationStatus();
          }, 3000);
          
          // Optionally zoom to user location
          map.setView([userLocation.lat, userLocation.lng], 14);
        },
        function(error) {
          locationBtn.classList.remove('loading');
          let errorMessage = 'Unable to get location';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout';
              break;
          }
          
          showLocationStatus(errorMessage, 'error');
          
          // Hide status after 5 seconds
          setTimeout(() => {
            hideLocationStatus();
          }, 5000);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
    
    // Show location status
    function showLocationStatus(message, type) {
      const statusEl = document.getElementById('location-status');
      statusEl.textContent = message;
      statusEl.className = `location-status ${type}`;
      statusEl.style.display = 'block';
    }
    
    // Hide location status
    function hideLocationStatus() {
      const statusEl = document.getElementById('location-status');
      statusEl.style.display = 'none';
    }
    
    // Navigate to a specific resort
    function navigateToResort(resortId) {
      if (!userLocation) {
        alert('Please allow location access first by clicking the location button.');
        return;
      }
      
      const resort = resorts[resortId];
      if (!resort) return;
      
      // Remove existing routing control
      if (routingControl) {
        map.removeControl(routingControl);
      }
      
      // Create new routing control
      routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLocation.lat, userLocation.lng),
          L.latLng(resort.lat, resort.lng)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: function() { return null; }, // Don't create default markers
        lineOptions: {
          styles: [{ color: '#3498db', weight: 4, opacity: 0.7 }]
        }
      }).addTo(map);
      
      // Fit map to show both points
      const group = new L.featureGroup([
        L.marker([userLocation.lat, userLocation.lng]),
        L.marker([resort.lat, resort.lng])
      ]);
      map.fitBounds(group.getBounds().pad(0.1));
    }
    
    // Navigate to currently active resort
    function navigateToActiveResort() {
      if (activeResortId) {
        navigateToResort(activeResortId);
      }
    }
    
    // Highlight a specific marker
    function highlightMarker(resortId) {
      // Reset all markers
      for (const [id, marker] of Object.entries(markers)) {
        marker.getElement().classList.remove('highlight');
      }
      
      // Highlight selected marker
      if (markers[resortId]) {
        markers[resortId].getElement().classList.add('highlight');
        activeMarker = markers[resortId];
      }
    }
    
    // Show resort information panel
    function showResortInfo(resortId) {
      const resort = resorts[resortId];
      if (!resort) return;
      
      document.getElementById('info-title').textContent = resort.name;
      document.getElementById('info-address').textContent = resort.address;
      document.getElementById('info-details').textContent = `${resort.bedrooms} bedrooms • ${resort.priceValue}`;
      document.getElementById('info-description').textContent = resort.description;
      document.getElementById('info-facilities').textContent = resort.facilities;
      document.getElementById('info-price').textContent = resort.priceValue;
      
      // Show/hide website button
      const websiteContainer = document.getElementById('website-container');
      const websiteBtn = document.getElementById('info-website');
      if (resort.website && resort.website !== '#') {
        websiteBtn.href = resort.website;
        websiteContainer.style.display = 'block';
      } else {
        websiteContainer.style.display = 'block'; // Still show navigate button
      }
      
      document.getElementById('resort-info').classList.add('visible');
      activeResortId = resortId;
    }
    
    // Close resort information panel
    function closeResortInfo() {
      document.getElementById('resort-info').classList.remove('visible');
      
      // Reset marker highlights
      for (const marker of Object.values(markers)) {
        marker.getElement().classList.remove('highlight');
      }
      
      activeMarker = null;
      activeResortId = null;
    }
    
    // Populate resort list in sidebar
    function populateResortList(resortsToShow) {
      const resortList = document.getElementById('resort-list');
      const noResults = document.getElementById('no-results');
      
      resortList.innerHTML = '';
      
      if (Object.keys(resortsToShow).length === 0) {
        noResults.style.display = 'block';
        return;
      }
      
      noResults.style.display = 'none';
      
      for (const [id, resort] of Object.entries(resortsToShow)) {
        const listItem = document.createElement('div');
        listItem.className = 'place-item';
        listItem.innerHTML = `
          <div class="place-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div class="place-info">
            <div class="place-name">${resort.name}</div>
            <div class="place-address">${resort.address}</div>
            <div class="place-details">${resort.bedrooms} bedrooms • ${resort.priceValue}</div>
            <button class="navigate-btn" onclick="navigateToResort('${id}')">Navigate</button>
          </div>
        `;
        
        listItem.addEventListener('click', function(e) {
          if (e.target.classList.contains('navigate-btn')) return;
          
          showResortInfo(id);
          highlightMarker(id);
          map.setView([resort.lat, resort.lng], 17);
          
          // Close sidebar on mobile
          if (window.innerWidth <= 768) {
            toggleSidebar();
          }
        });
        
        resortList.appendChild(listItem);
      }
    }
    
    // Filter resorts based on search criteria
    function filterResorts() {
      const bedrooms = document.getElementById('bedrooms').value;
      const priceRange = document.getElementById('price').value;
      const selectedAmenities = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      
      const filtered = {};
      
      for (const [id, resort] of Object.entries(resorts)) {
        let matches = true;
        
        // Filter by bedrooms
        if (bedrooms && resort.bedrooms < parseInt(bedrooms)) {
          matches = false;
        }
        
        // Filter by price range
        if (priceRange && resort.price !== priceRange) {
          matches = false;
        }
        
        // Filter by amenities (resort must have ALL selected amenities)
        if (selectedAmenities.length > 0) {
          const hasAllAmenities = selectedAmenities.every(amenity => 
            resort.amenities.includes(amenity)
          );
          if (!hasAllAmenities) {
            matches = false;
          }
        }
        
        if (matches) {
          filtered[id] = resort;
        }
      }
      
      return filtered;
    }
    
    // Update map markers based on filtered results
    function updateMapMarkers(resortsToShow) {
      // Hide all markers
      for (const [id, marker] of Object.entries(markers)) {
        if (resortsToShow[id]) {
          marker.addTo(map);
        } else {
          map.removeLayer(marker);
        }
      }
    }
    
    // Handle search form submission
    function handleSearch(event) {
      event.preventDefault();
      
      filteredResorts = filterResorts();
      populateResortList(filteredResorts);
      updateMapMarkers(filteredResorts);
      
      // Show filter notice
      const hasFilters = document.getElementById('bedrooms').value || 
                        document.getElementById('price').value ||
                        document.querySelectorAll('input[type="checkbox"]:checked').length > 0;
      
      document.getElementById('filter-notice').classList.toggle('active', hasFilters);
      
      // Close resort info if active resort is filtered out
      if (activeResortId && !filteredResorts[activeResortId]) {
        closeResortInfo();
      }
    }
    
    // Reset all filters
    function resetFilters() {
      document.getElementById('search-form').reset();
      filteredResorts = {};
      populateResortList(resorts);
      updateMapMarkers(resorts);
      document.getElementById('filter-notice').classList.remove('active');
    }
    
    // Toggle sidebar visibility
    function toggleSidebar() {
      const sidebar = document.getElementById('sidebar');
      const map = document.getElementById('map');
      
      sidebar.classList.toggle('open');
      
      // Adjust map margin when sidebar is open on desktop
      if (window.innerWidth > 768) {
        if (sidebar.classList.contains('open')) {
          map.style.marginLeft = '320px';
        } else {
          map.style.marginLeft = '0';
        }
        
        // Invalidate map size after transition
        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      }
    }
    
    // View all resorts (reset view)
    function viewAllResorts() {
      // Reset any active info panels
      closeResortInfo();
      
      // Remove any routing
      if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
      }
      
      // Show all markers
      updateMapMarkers(resorts);
      
      // Fit map to show all resorts
      const group = new L.featureGroup(Object.values(markers));
      map.fitBounds(group.getBounds().pad(0.1));
      
      // Reset filters if any are active
      const hasFilters = document.getElementById('bedrooms').value || 
                        document.getElementById('price').value ||
                        document.querySelectorAll('input[type="checkbox"]:checked').length > 0;
      
      if (hasFilters) {
        resetFilters();
      }
    }
    
    // Event listeners
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize map
      initMap();
      
      // Sidebar toggle
      document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
      document.getElementById('sidebar-close').addEventListener('click', toggleSidebar);
      
      // Search form
      document.getElementById('search-form').addEventListener('submit', handleSearch);
      
      // View all resorts button
      document.getElementById('view-all-btn').addEventListener('click', viewAllResorts);
      
      // Location button
      document.getElementById('location-btn').addEventListener('click', getCurrentLocation);
      
      // Close sidebar when clicking on map (mobile)
      map?.on('click', function() {
        if (window.innerWidth <= 768) {
          const sidebar = document.getElementById('sidebar');
          if (sidebar.classList.contains('open')) {
            toggleSidebar();
          }
        }
      });
      
      // Handle window resize
      window.addEventListener('resize', function() {
        const sidebar = document.getElementById('sidebar');
        const mapEl = document.getElementById('map');
        
        if (window.innerWidth <= 768) {
          mapEl.style.marginLeft = '0';
        } else if (sidebar.classList.contains('open')) {
          mapEl.style.marginLeft = '320px';
        }
        
        // Invalidate map size
        if (map) {
          map.invalidateSize();
        }
      });
    });
