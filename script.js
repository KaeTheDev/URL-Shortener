// ===== Select elements from the page (DOM elements) =====
// These are the parts of the page we want to interact with
const form = document.querySelector(".shortener-box form"); // The form where user enters URL
const longLinkInput = document.querySelector("#longLinkInput"); // The input box for the long URL
const shortenedLinksContainer = document.querySelector("#shortened-links"); // Where we will show shortened links
const errorMessage = document.querySelector("#form-error"); // The area to show error messages

// ===== Bitly API token =====
// This is like a password to use the Bitly service
const BITLY_TOKEN = "d2f9509562e5a834f01bf7ac8728d783f90d192f";

// ===== Helper function: check if a URL is valid =====
// This function makes sure the user typed a proper URL before we send it to Bitly
function isValidURL(url) {
  const pattern = /^(https?:\/\/)([a-z0-9-]+\.)+[a-z]{2,6}(:\d+)?(\/.*)?$/i; // Regex pattern to match URLs
  const domainPart = url.match(/^https?:\/\/([^/:?#]+)/i)?.[1]; // Extract the domain part like example.com
  
  if (!domainPart || domainPart.split('.').length < 2) return false; // Must have at least one dot in domain
  
  const tld = domainPart.split('.').pop(); // Get the last part like 'com' or 'org'
  return pattern.test(url) && tld.length >= 2 && tld.length <= 6; // Check URL pattern and TLD length
}

// ===== Function to display a shortened link on the page =====
function renderLink(longUrl, shortUrl) {
  const linkRow = document.createElement("div"); // Create a new div for this link
  linkRow.className = "container mb-3"; // Add some styling classes

  // Add the HTML inside the div
  linkRow.innerHTML = `
    <div class="row bg-white rounded align-items-center py-3 px-3">
      <div class="col-12 col-md-6 mb-2 mb-md-0">
        <span class="text-dark text-truncate d-block">${longUrl}</span> <!-- Show the original long URL -->
      </div>
      <div class="col-12 col-md-4 mb-2 mb-md-0">
        <a href="${shortUrl}" target="_blank" class="fw-bold" style="color: hsl(180, 66%, 49%);">${shortUrl}</a> <!-- Clickable short URL -->
      </div>
      <div class="col-12 col-md-2 text-md-end">
        <button class="btn copy-btn w-100 w-md-auto" style="background: hsl(180, 66%, 49%); color: white;">Copy</button> <!-- Button to copy short URL -->
      </div>
    </div>
  `;

  shortenedLinksContainer.appendChild(linkRow); // Add the new link to the page

  // ===== Add functionality to the copy button =====
  const copyBtn = linkRow.querySelector(".copy-btn"); // Find the copy button inside this row
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(shortUrl); // Copy the short URL to clipboard
    copyBtn.textContent = "Copied!"; // Change button text
    copyBtn.style.background = "hsl(257, 27%, 26%)"; // Change button color

    // After 2 seconds, reset button text and color
    setTimeout(() => {
      copyBtn.textContent = "Copy";
      copyBtn.style.background = "hsl(180, 66%, 49%)";
    }, 2000);
  });
}

// ===== Function to call Bitly API and shorten the URL =====
async function shortenURL(longUrl) {
  // Send POST request to Bitly with the long URL
  const response = await fetch("https://api-ssl.bitly.com/v4/shorten", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Tell Bitly we are sending JSON
      Authorization: `Bearer ${BITLY_TOKEN}`, // Use our API token
    },
    body: JSON.stringify({ long_url: longUrl }), // Send the long URL as JSON
  });

  const data = await response.json(); // Convert the response to JavaScript object

  // If the response is not OK, handle errors
  if (!response.ok) {
    console.error("Bitly API Error:", response.status, data); // Log full error in console

    if (data.message?.includes("RATE_LIMIT")) throw "RATE_LIMIT";
    if (response.status === 403) throw "FORBIDDEN";
    if (response.status === 401) throw "UNAUTHORIZED";
    if (data.message?.includes("INVALID_ARG")) throw "INVALID_URL";

    throw { type: "API_ERROR", status: response.status, message: data.message || "Unknown error" };
  }

  return data.link; // Return the short URL
}

// ===== Handle form submission =====
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Stop the page from reloading

  const userInput = longLinkInput.value.trim(); // Get user input and remove extra spaces

  // ===== Check if input is empty =====
  if (!userInput) {
    errorMessage.textContent = "Please enter a URL."; // Show error
    errorMessage.style.display = "block"; // Make error visible
    longLinkInput.classList.add("is-invalid"); // Add red border to input
    return; // Stop function here
  }

  // ===== Check if URL is valid =====
  if (!isValidURL(userInput)) {
    errorMessage.textContent = "Please enter a valid URL starting with http:// or https:// and including a valid domain (like .com, .org).";
    errorMessage.style.display = "block";
    longLinkInput.classList.add("is-invalid");
    return;
  }

  // ===== Clear previous errors =====
  errorMessage.style.display = "none";
  longLinkInput.classList.remove("is-invalid");

  // ===== Try to shorten the URL =====
  try {
    const shortUrl = await shortenURL(userInput); // Call Bitly API
    renderLink(userInput, shortUrl); // Display the shortened URL
  } catch (error) {
    // Show different error messages depending on error type
    if (error === "RATE_LIMIT") {
      errorMessage.textContent = "Bitly API quota reached. Try again later.";
    } else if (error === "FORBIDDEN") {
      errorMessage.textContent = "API access denied. Your Bitly token may be invalid or you've exceeded your quota.";
    } else if (error === "UNAUTHORIZED") {
      errorMessage.textContent = "Bitly authentication failed. Invalid API token.";
    } else if (error === "INVALID_URL") {
      errorMessage.textContent = "Invalid link detected by the shortening service. Please check your URL.";
    } else if (error.type === "API_ERROR") {
      errorMessage.textContent = `API Error (${error.status}): ${error.message}`;
    } else {
      errorMessage.textContent = "Unexpected error. Check console for details.";
    }
    errorMessage.style.display = "block"; // Show error message
    longLinkInput.classList.add("is-invalid"); // Highlight input
    console.error("Full error:", error); // Log full error
  }

  longLinkInput.value = ""; // Clear input box for next URL
});