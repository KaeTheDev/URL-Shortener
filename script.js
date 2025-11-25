const form = document.querySelector(".shortener-box form");
const longLinkInput = document.querySelector("#long-link-input");
const shortenedLinksContainer = document.querySelector("#shortened-links");

// MOCK API function for testing
async function shortenURL(longUrl) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fakeShort = "https://cutt.ly/fake" + Math.floor(Math.random() * 1000);
      resolve(fakeShort);
    }, 500);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const longUrl = longLinkInput.value.trim();
  if (!longUrl) return;

  const shortUrl = await shortenURL(longUrl);

  if (shortUrl) {
    // Create a new Bootstrap row for each shortened link
    const linkRow = document.createElement("div");
    linkRow.className = "container mb-3";
    linkRow.innerHTML = `
      <div class="row bg-white rounded align-items-center py-3 px-3">
        <div class="col-12 col-md-6 mb-2 mb-md-0">
          <span class="text-dark text-truncate d-block">${longUrl}</span>
        </div>
        <div class="col-12 col-md-4 mb-2 mb-md-0">
          <a href="${shortUrl}" target="_blank" class="text-decoration-none fw-bold" style="color: hsl(180, 66%, 49%);">${shortUrl}</a>
        </div>
        <div class="col-12 col-md-2 text-md-end">
          <button class="btn copy-btn w-100 w-md-auto" style="background: hsl(180, 66%, 49%); color: white; border-radius: 5px; padding: 8px 24px;">Copy</button>
        </div>
      </div>
    `;
    
    shortenedLinksContainer.appendChild(linkRow);
    
    // Copy functionality
    const copyBtn = linkRow.querySelector(".copy-btn");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(shortUrl);
      copyBtn.textContent = "Copied!";
      copyBtn.style.background = "hsl(257, 27%, 26%)";
      
      setTimeout(() => {
        copyBtn.textContent = "Copy";
        copyBtn.style.background = "hsl(180, 66%, 49%)";
      }, 2000);
    });
  }
  
  // Clear the input
  longLinkInput.value = "";
});