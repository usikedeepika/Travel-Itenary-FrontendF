// Initialize speech recognition
// function initializeSpeechRecognition() {
//     if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//         recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//         recognition.continuous = false;
//         recognition.interimResults = false;
//         recognition.lang = 'en-US';

//         recognition.onresult = function(event) {
//             const transcript = event.results[0][0].transcript;
//             document.getElementById('voiceResult').value = transcript;
//             document.getElementById('voiceStatus').textContent = 'Voice captured successfully!';
//         };

//         recognition.onerror = function(event) {
//             console.error('Speech recognition error:', event.error);
//             document.getElementById('voiceStatus').textContent = 'Error: ' + event.error;
//         };

//         recognition.onend = function() {
//             isRecording = false;
//             document.getElementById('voiceIcon').classList.remove('recording');
//             document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
//         };
//     }
// }

// // Search interface management functions
// function activateAISearch() {
//     hideAllInterfaces();
//     document.getElementById('aiSearchInterface').style.display = 'block';
//     document.getElementById('aiSearchBtn').style.display = 'none';
// }

// function activateVoiceSearch() {
//     hideAllInterfaces();
//     document.getElementById('voiceSearchInterface').style.display = 'block';
//     document.getElementById('voiceSearchBtn').style.display = 'none';
// }

// function activateManualSearch() {
//     hideAllInterfaces();
//     document.getElementById('manualSearchInterface').style.display = 'block';
//     document.getElementById('manualSearchBtn').style.display = 'none';
// }

// function hideAllInterfaces() {
//     const interfaces = ['aiSearchInterface', 'voiceSearchInterface', 'manualSearchInterface'];
//     const buttons = ['aiSearchBtn', 'voiceSearchBtn', 'manualSearchBtn'];
    
//     interfaces.forEach(id => {
//         const element = document.getElementById(id);
//         if (element) element.style.display = 'none';
//     });
    
//     buttons.forEach(id => {
//         const element = document.getElementById(id);
//         if (element) element.style.display = 'block';
//     });
// }

// // Voice recording functions
// function toggleVoiceRecording() {
//     if (!recognition) {
//         alert('Speech recognition is not supported in your browser.');
//         return;
//     }

//     if (isRecording) {
//         recognition.stop();
//     } else {
//         recognition.start();
//         isRecording = true;
//         document.getElementById('voiceIcon').classList.add('recording');
//         document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
//         document.getElementById('voiceStatus').textContent = 'Listening...';
//     }
// }

// // Search functions
// async function performSearch() {
//     const query = document.getElementById('mainSearch').value;
//     if (query.trim()) {
//         showLoadingState();
//         try {
//             const aiResponse = await generateTripSuggestions(query);
//             showResults(`<h4>Search Results for: "${query}"</h4><br>${aiResponse}`);
//         } catch (error) {
//             showResults(`<h4>Search Results for: "${query}"</h4><br><p>Here are some general suggestions for your trip...</p>`);
//         }
//     }
// }

// async function generateAISuggestions() {
//     const prompt = document.getElementById('aiPrompt').value;
//     if (prompt.trim()) {
//         showLoadingState();
//         try {
//             const aiResponse = await generateTripSuggestions(prompt);
//             showResults(`<h4>AI Trip Analysis</h4><br><p><strong>Your Request:</strong> "${prompt}"</p><br>${aiResponse}`);
//         } catch (error) {
//             showResults(`<h4>AI Trip Analysis</h4><br><p><strong>Your Request:</strong> "${prompt}"</p><br><p>Based on your preferences, here are some personalized suggestions...</p>`);
//         }
//     }
// }

// async function performManualSearch() {
//     const destination = document.getElementById('destination').value;
//     const duration = document.getElementById('duration').value;
//     const budget = document.getElementById('budget').value;
//     const style = document.getElementById('travelStyle').value;

//     if (destination.trim()) {
//         showLoadingState();
//         const searchQuery = `Destination: ${destination}, Duration: ${duration} days, Budget: $${budget}, Style: ${style}`;
        
//         try {
//             const aiResponse = await generateTripSuggestions(searchQuery);
//             showResults(`<h4>Manual Search Results</h4><br><p><strong>Search Criteria:</strong> ${searchQuery}</p><br>${aiResponse}`);
//         } catch (error) {
//             showResults(`<h4>Manual Search Results</h4><br><p><strong>Search Criteria:</strong> ${searchQuery}</p><br><p>Here are some suggestions based on your criteria...</p>`);
//         }
//     }
// }

// // OpenAI API integration
// async function generateTripSuggestions(userInput) {
//     try {
//         // Create a focused prompt for essential trip information
//         const systemPrompt = `You are a travel advisor. Provide a concise response with ONLY the following information in this exact format:

//         DESTINATION: [Main destination name]
//         DURATION: [Suggested trip duration]
//         BUDGET: [Estimated budget range]
//         BEST_TIME: [Best time to visit]
//         TOP_ATTRACTIONS: [List 3-4 main attractions, separated by semicolons]
//         ACCOMMODATION: [Brief accommodation recommendation]
//         LOCAL_FOOD: [2-3 must-try local dishes, separated by semicolons]
//         TRAVEL_TIP: [One important travel tip]

//         Keep each section brief and specific. Do not include extra formatting or explanations.`;

//         const userPrompt = `Please provide essential travel information for: ${userInput}`;

//         const response = await callGitHubAI(`${systemPrompt}\n\nUser Request: ${userPrompt}`);
//         return formatTripResponse(response);
//     } catch (error) {
//         console.error('Error generating trip suggestions:', error);
//         throw error;
//     }
// }

// // Format AI response into a structured table
// async function formatTripResponse(response) {
//     try {
//         const lines = response.split('\n');
//         const tripData = {};
//         const authToken = localStorage.getItem("JWT_TOKEN");
//         const currentUser = localStorage.getItem('CURRENT_USER');
//         const user = JSON.parse(currentUser);
//         lines.forEach(line => {
//             if (line.includes(':')) {
//                 const [key, value] = line.split(':');
//                 if (key && value) {
//                     tripData[key.trim()] = value.trim();
//                 }
//             }
//         });
//         const backendResponse = await fetch(`${AUTH_ITINERARY_PATH}?userId=${encodeURIComponent(user.id)}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${authToken}`,
//                     'userName': user.userName                
//              },
//             body: JSON.stringify({
//                 destination: tripData.DESTINATION,
//                 fullItinerary: response,
//                 budgetRange: tripData.BUDGET
//             })
//         });
//         if(!backendResponse.ok)
//         {
//             console.log("Failed to update backend")
//         }
//         return `
//             <div class="trip-info-container">
//                 <table class="table table-striped table-hover">
//                     <thead class="table-dark">
//                         <tr>
//                             <th colspan="2" class="text-center">✈️ Trip Planning Information</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         <tr>
//                             <td><strong>🎯 Destination</strong></td>
//                             <td>${tripData.DESTINATION || 'N/A'}</td>
//                         </tr>
//                         <tr>
//                             <td><strong>⏱️ Duration</strong></td>
//                             <td>${tripData.DURATION || 'N/A'}</td>
//                         </tr>
//                         <tr>
//                             <td><strong>💰 Budget</strong></td>
//                             <td>${tripData.BUDGET || 'N/A'}</td>
//                         </tr>
//                         <tr>
//                             <td><strong>🌤️ Best Time</strong></td>
//                             <td>${tripData.BEST_TIME || 'N/A'}</td>
//                         </tr>
//                         <tr>
//                             <td><strong>🏛️ Top Attractions</strong></td>
//                             <td>${formatList(tripData.TOP_ATTRACTIONS)}</td>
//                         </tr>
//                         <tr>
//                             <td><strong>🏨 Accommodation</strong></td>
//                             <td>${tripData.ACCOMMODATION || 'N/A'}</td>
//                         </tr>
//                         <tr>
//                             <td><strong>🍽️ Local Food</strong></td>
//                             <td>${formatList(tripData.LOCAL_FOOD)}</td>
//                         </tr>
//                         <tr>
//                             <td><strong>💡 Travel Tip</strong></td>
//                             <td>${tripData.TRAVEL_TIP || 'N/A'}</td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//         `;
//     } catch (error) {
//         console.error('Error formatting response:', error);
//         return `<div class="alert alert-info">${response}</div>`;
//     }
// }

// // Helper function to format semicolon-separated lists
// function formatList(text) {
//     if (!text) return 'N/A';
//     return text.split(';').map(item => `• ${item.trim()}`).join('<br>');
// }

// // UI helper functions
// function showLoadingState() {
//     const resultsContent = document.getElementById('resultsContent');
//     resultsContent.innerHTML = `
//         <div class="text-center">
//             <div class="spinner-border text-primary" role="status">
//                 <span class="visually-hidden">Loading...</span>
//             </div>
//             <p class="mt-2">Generating personalized travel suggestions...</p>
//         </div>
//     `;
//     document.getElementById('searchResults').style.display = 'block';
//     document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
// }

// function showResults(content) {
//     document.getElementById('resultsContent').innerHTML = content;
//     document.getElementById('searchResults').style.display = 'block';
//     document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
// }

// // Initialize everything when the page loads
// document.addEventListener('DOMContentLoaded', function() {
//     initializeSpeechRecognition();
//     console.log('Travel Itinerary App initialized successfully!');
//     initCarousel();
// });

// // Initialize carousel
// function initCarousel() {
//     createDots();
//     startAutoSlide();
//     updateCarousel();
// }

// // Create navigation dots
// function createDots() {
//     const dotsContainer = document.getElementById('carouselDots');
//     for (let i = 0; i < totalSlides; i++) {
//         const dot = document.createElement('div');
//         dot.className = 'carousel-dot';
//         dot.onclick = () => goToSlide(i);
//         dotsContainer.appendChild(dot);
//     }
// }

// // Move carousel
// function moveCarousel(direction) {
//     currentSlide += direction;
//     if (currentSlide >= totalSlides) {
//         currentSlide = 0;
//     } else if (currentSlide < 0) {
//         currentSlide = totalSlides - 1;
//     }
//     updateCarousel();
//     resetAutoSlide();
// }

// // Go to specific slide
// function goToSlide(slideIndex) {
//     currentSlide = slideIndex;
//     updateCarousel();
//     resetAutoSlide();
// }

// // Update carousel display
// function updateCarousel() {
//     const track = document.getElementById('countryCarousel');
//     const slideWidth = 320; // 300px width + 20px gap
//     const offset = -currentSlide * slideWidth;
//     track.style.transform = `translateX(${offset}px)`;
    
//     // Update dots
//     const dots = document.querySelectorAll('.carousel-dot');
//     dots.forEach((dot, index) => {
//         dot.classList.toggle('active', index === currentSlide);
//     });
// }

// // Start auto-sliding
// function startAutoSlide() {
//     autoSlideInterval = setInterval(() => {
//         moveCarousel(1);
//     }, 3000); // Change slide every 3 seconds
// }

// // Export functions for global access (if needed)
// window.travelApp = {
//     performSearch,
//     generateAISuggestions,
//     performManualSearch,
//     toggleVoiceRecording,
//     activateAISearch,
//     activateVoiceSearch,
//     activateManualSearch
// };


// Global variables
let isRecording = false;
let recognition = null;
const AUTH_ITINERARY_PATH = 'http://localhost:8081/api/itineraries';

// Carousel functionality
let currentSlide = 0;
let autoSlideInterval;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;

// Initialize speech recognition
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('voiceResult').value = transcript;
            document.getElementById('voiceStatus').textContent = 'Voice captured successfully!';
            performVoiceSearch();
        };  

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            document.getElementById('voiceStatus').textContent = 'Error: ' + event.error;
        };

        recognition.onend = function() {
            isRecording = false;
            document.getElementById('voiceIcon').classList.remove('recording');
            document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
        };
    }
}

// Search interface management functions
function activateAISearch() {
    hideAllInterfaces();
    document.getElementById('aiSearchInterface').style.display = 'block';
    document.getElementById('aiSearchBtn').style.display = 'none';
}

function activateVoiceSearch() {
    hideAllInterfaces();
    document.getElementById('voiceSearchInterface').style.display = 'block';
    document.getElementById('voiceSearchBtn').style.display = 'none';
}

function activateManualSearch() {
    hideAllInterfaces();
    document.getElementById('manualSearchInterface').style.display = 'block';
    document.getElementById('manualSearchBtn').style.display = 'none';
}

function hideAllInterfaces() {
    const interfaces = ['aiSearchInterface', 'voiceSearchInterface', 'manualSearchInterface'];
    const buttons = ['aiSearchBtn', 'voiceSearchBtn', 'manualSearchBtn'];
    
    interfaces.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    buttons.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'block';
    });
}

// Voice recording functions
function toggleVoiceRecording() {
    if (!recognition) {
        alert('Speech recognition is not supported in your browser.');
        return;
    }

    if (isRecording) {
        recognition.stop();
    } else {
        recognition.start();
        isRecording = true;
        document.getElementById('voiceIcon').classList.add('recording');
        document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
        document.getElementById('voiceStatus').textContent = 'Listening...';
    }
}

// Search functions

async function performVoiceSearch() {
    const query = document.getElementById('voiceResult').value;
    if (query.trim()) {
        showLoadingState();
        try {
            const aiResponse = await generateTripSuggestions(query);
            showResults(`<h4>Search Results for: "${query}"</h4><br>${aiResponse}`);
        } catch (error) {
            showResults(`<h4>Search Results for: "${query}"</h4><br><p>Here are some general suggestions for your trip...</p>`);
        }
    }
}


async function performSearch() {
    const query = document.getElementById('mainSearch').value;
    if (query.trim()) {
        showLoadingState();
        try {
            const aiResponse = await generateTripSuggestions(query);
            showResults(`<h4>Search Results for: "${query}"</h4><br>${aiResponse}`);
        } catch (error) {
            showResults(`<h4>Search Results for: "${query}"</h4><br><p>Here are some general suggestions for your trip...</p>`);
        }
    }
}

async function generateAISuggestions() {
    const prompt = document.getElementById('aiPrompt').value;
    if (prompt.trim()) {
        showLoadingState();
        try {
            const aiResponse = await generateTripSuggestions(prompt);
            showResults(`<h4>AI Trip Analysis</h4><br><p><strong>Your Request:</strong> "${prompt}"</p><br>${aiResponse}`);
        } catch (error) {
            showResults(`<h4>AI Trip Analysis</h4><br><p><strong>Your Request:</strong> "${prompt}"</p><br><p>Based on your preferences, here are some personalized suggestions...</p>`);
        }
    }
}

async function performManualSearch() {
    const destination = document.getElementById('destination').value;
    const duration = document.getElementById('duration').value;
    const budget = document.getElementById('budget').value;
    const style = document.getElementById('travelStyle').value;

    if (destination.trim()) {
        showLoadingState();
        const searchQuery = `Destination: ${destination}, Duration: ${duration} days, Budget: $${budget}, Style: ${style}`;
        
        try {
            const aiResponse = await generateTripSuggestions(searchQuery);
            showResults(`<h4>Manual Search Results</h4><br><p><strong>Search Criteria:</strong> ${searchQuery}</p><br>${aiResponse}`);
        } catch (error) {
            showResults(`<h4>Manual Search Results</h4><br><p><strong>Search Criteria:</strong> ${searchQuery}</p><br><p>Here are some suggestions based on your criteria...</p>`);
        }
    }
}

// OpenAI API integration
async function generateTripSuggestions(userInput) {
    try {
        // Create a focused prompt for essential trip information
        const systemPrompt = `You are a travel advisor. Provide a concise response with ONLY the following information in this exact format:

        DESTINATION: [Main destination name]
        DURATION: [Suggested trip duration]
        BUDGET: [Estimated budget range]
        BEST_TIME: [Best time to visit]
        TOP_ATTRACTIONS: [List 3-4 main attractions, separated by semicolons]
        ACCOMMODATION: [Brief accommodation recommendation]
        LOCAL_FOOD: [2-3 must-try local dishes, separated by semicolons]
        TRAVEL_TIP: [One important travel tip]

        Keep each section brief and specific. Do not include extra formatting or explanations.`;

        const userPrompt = `Please provide essential travel information for: ${userInput}`;

        const response = await callGitHubAI(`${systemPrompt}\n\nUser Request: ${userPrompt}`);
        return formatTripResponse(response);
    } catch (error) {
        console.error('Error generating trip suggestions:', error);
        throw error;
    }
}

// Format AI response into a structured table
async function formatTripResponse(response) {
    try {
        const lines = response.split('\n');
        const tripData = {};
        const authToken = localStorage.getItem("JWT_TOKEN");
        const currentUser = localStorage.getItem('CURRENT_USER');
        const user = JSON.parse(currentUser);
        lines.forEach(line => {
            if (line.includes(':')) {
                const [key, value] = line.split(':');
                if (key && value) {
                    tripData[key.trim()] = value.trim();
                }
            }
        });
        const backendResponse = await fetch(`${AUTH_ITINERARY_PATH}?userId=${encodeURIComponent(user.id)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                    'userName': user.userName                
             },
            body: JSON.stringify({
                destination: tripData.DESTINATION,
                fullItinerary: response,
                budgetRange: tripData.BUDGET
            })
        });
        if(!backendResponse.ok)
        {
            console.log("Failed to update backend")
        }
        return `
            <div class="trip-info-container">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th colspan="2" class="text-center">✈️ Trip Planning Information</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>🎯 Destination</strong></td>
                            <td>${tripData.DESTINATION || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>⏱️ Duration</strong></td>
                            <td>${tripData.DURATION || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>💰 Budget</strong></td>
                            <td>${tripData.BUDGET || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>🌤️ Best Time</strong></td>
                            <td>${tripData.BEST_TIME || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>🏛️ Top Attractions</strong></td>
                            <td>${formatList(tripData.TOP_ATTRACTIONS)}</td>
                        </tr>
                        <tr>
                            <td><strong>🏨 Accommodation</strong></td>
                            <td>${tripData.ACCOMMODATION || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>🍽️ Local Food</strong></td>
                            <td>${formatList(tripData.LOCAL_FOOD)}</td>
                        </tr>
                        <tr>
                            <td><strong>💡 Travel Tip</strong></td>
                            <td>${tripData.TRAVEL_TIP || 'N/A'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error formatting response:', error);
        return `<div class="alert alert-info">${response}</div>`;
    }
}

// Helper function to format semicolon-separated lists
function formatList(text) {
    if (!text) return 'N/A';
    return text.split(';').map(item => `• ${item.trim()}`).join('<br>');
}

// UI helper functions
function showLoadingState() {
    const resultsContent = document.getElementById('resultsContent');
    resultsContent.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Generating personalized travel suggestions...</p>
        </div>
    `;
    document.getElementById('searchResults').style.display = 'block';
    document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
}

function showResults(content) {
    document.getElementById('resultsContent').innerHTML = content;
    document.getElementById('searchResults').style.display = 'block';
    document.getElementById('searchResults').scrollIntoView({ behavior: 'smooth' });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSpeechRecognition();
    console.log('Travel Itinerary App initialized successfully!');
    initCarousel();
});

// Initialize carousel
function initCarousel() {
    createDots();
    startAutoSlide();
    updateCarousel();
}

// Create navigation dots
function createDots() {
    const dotsContainer = document.getElementById('carouselDots');
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }
}

// Move carousel
function moveCarousel(direction) {
    currentSlide += direction;
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    updateCarousel();
    resetAutoSlide();
}

// Go to specific slide
function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
    resetAutoSlide();
}

// Update carousel display
function updateCarousel() {
    const track = document.getElementById('countryCarousel');
    const slideWidth = 320; // 300px width + 20px gap
    const offset = -currentSlide * slideWidth;
    track.style.transform = `translateX(${offset}px)`;
    
    // Update dots
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Start auto-sliding
function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        moveCarousel(1);
    }, 3000); // Change slide every 3 seconds
}

// Reset auto-slide timer
function resetAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
}

// Export functions for global access (if needed)
window.travelApp = {
    performSearch,
    generateAISuggestions,
    performManualSearch,
    toggleVoiceRecording,
    activateAISearch,
    activateVoiceSearch,
    activateManualSearch
};
