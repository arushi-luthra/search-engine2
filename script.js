// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const searchHistoryList = document.getElementById('search-history-list');
const gravityBtn = document.getElementById('gravity-btn');

// Initialize search history from local storage or create an empty array
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Function to display search history
function displaySearchHistory() {
    searchHistoryList.innerHTML = '';
    
    if (searchHistory.length === 0) {
        searchHistoryList.innerHTML = '<li>No search history yet...</li>';
        return;
    }

    searchHistory.forEach((term, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${term} <span onclick="deleteSearchTerm(${index})">&times;</span>`;
        searchHistoryList.appendChild(li);
    });
}

// Function to add search term to history
function addSearchTerm(term) {
    if (term.trim() !== '' && !searchHistory.includes(term)) {
        searchHistory.push(term);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        displaySearchHistory();
    } else if (term.trim() === '') {
        alert('Search term cannot be empty!');
    } else {
        alert('Search term already exists in history.');
    }
}

// Function to clear search history
function clearSearchHistory() {
    if (confirm("Are you sure you want to clear your search history?")) {
        searchHistory = [];
        localStorage.removeItem('searchHistory');
        displaySearchHistory();
    }
}

// Function to delete a specific search term
function deleteSearchTerm(index) {
    searchHistory.splice(index, 1);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

// Matter.js Setup for Gravity
function applyGravity() {
    // Module aliases
    const Engine = Matter.Engine,
          Render = Matter.Render,
          World = Matter.World,
          Bodies = Matter.Bodies;

    // Create an engine
    const engine = Engine.create();

    // Create a renderer
    const render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: '#f4f4f4'
        }
    });

    // Get all elements to apply gravity
    const elements = document.querySelectorAll('.container, .btn, h1, h2, li, input');

    // Create Matter.js bodies for each element
    const elementBodies = [];

    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const body = Bodies.rectangle(rect.left + rect.width / 2, rect.top + rect.height / 2, rect.width, rect.height, {
            restitution: 1.0, // Full bounce effect for the elements
            friction: 0.9,
            frictionAir: 0.1, // Slow down slightly in the air
            render: {
                fillStyle: 'transparent' // Invisible physics bodies
            }
        });

        elementBodies.push({ body, element });
        World.add(engine.world, body);
    });

    // Add boundaries (left, right, top, bottom) to prevent elements from going off-screen
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, {
        isStatic: true // Ground doesn't move
    });

    const ceiling = Bodies.rectangle(window.innerWidth / 2, -50, window.innerWidth, 100, {
        isStatic: true // Ceiling prevents elements from escaping upward
    });

    const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, {
        isStatic: true // Left wall
    });

    const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, {
        isStatic: true // Right wall
    });

    // Add boundaries to the world
    World.add(engine.world, [ground, ceiling, leftWall, rightWall]);

    // Run the engine
    Engine.run(engine);

    // Run the renderer
    Render.run(render);

    // Update DOM element positions according to physics bodies
    function updateElementsPosition() {
        elementBodies.forEach(({ body, element }) => {
            element.style.position = 'absolute';
            element.style.left = `${body.position.x - element.offsetWidth / 2}px`;
            element.style.top = `${body.position.y - element.offsetHeight / 2}px`;
            element.style.transform = `rotate(${body.angle}rad)`;
        });
        requestAnimationFrame(updateElementsPosition);
    }
    
    // Start updating the element positions according to physics bodies
    updateElementsPosition();
}

// Event Listeners
searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value;
    addSearchTerm(searchTerm);
    searchInput.value = '';  // Clear the input after adding search term
});

clearHistoryBtn.addEventListener('click', clearSearchHistory);
gravityBtn.addEventListener('click', applyGravity); // Trigger gravity effect

// Display search history on page load
displaySearchHistory();
searchInput.addEventListener('keyup', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredHistory = searchHistory.filter(term => term.toLowerCase().includes(searchTerm));
    // Display filtered history as suggestions below input
});
