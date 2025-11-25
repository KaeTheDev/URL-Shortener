const form = document.querySelector(".shortener-box form");
const longLinkInput = document.querySelector("#longLinkInput");
const shortenedLinksContainer = document.querySelector("#shortened-links");
const errorMessage = document.querySelector("#form-error");

// Mock API
async function shortenURL(longUrl) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const rand = Math.random();
      if (rand < 0.05) return reject("RATE_LIMIT");
      if (rand < 0.1) return reject("INVALID_URL");
      resolve("https://cutt.ly/fake" + Math.floor(Math.random() * 1000));
    }, 500);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let longUrl = longLinkInput.value.trim();

  // Auto-add protocol if missing
  if (!longUrl.match(/^https?:\/\//)) {
    longUrl = `https://${longUrl}`;
  }

  if (!longUrl) {
    errorMessage.textContent = "Please enter a URL.";
    errorMessage.style.display = "block";
    longLinkInput.classList.add("is-invalid");
    return;
  }

  errorMessage.style.display = "none";
  longLinkInput.classList.remove("is-invalid");

  try {
    const shortUrl = await shortenURL(longUrl);

    // Add shortened link
    const linkRow = document.createElement("div");
    linkRow.className = "container mb-3";
    linkRow.innerHTML = `
      <div class="row bg-white rounded align-items-center py-3 px-3">
        <div class="col-12 col-md-6">
          <span class="text-dark text-truncate d-block">${longUrl}</span>
        </div>
        <div class="col-12 col-md-4">
          <a href="${shortUrl}" target="_blank" class="fw-bold" style="color: hsl(180, 66%, 49%);">${shortUrl}</a>
        </div>
        <div class="col-12 col-md-2 text-md-end">
          <button class="btn copy-btn w-100" style="background: hsl(180, 66%, 49%); color: white;">Copy</button>
        </div>
      </div>
    `;
    shortenedLinksContainer.appendChild(linkRow);

    // Copy button logic
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
  } catch (error) {
    if (error === "RATE_LIMIT") {
      errorMessage.textContent = "API quota reached. Try again later or use a different service.";
    } else if (error === "INVALID_URL") {
      errorMessage.textContent = "Invalid link detected. Please check your URL.";
    } else {
      errorMessage.textContent = "Unexpected error. Try again.";
    }
    errorMessage.style.display = "block";
    longLinkInput.classList.add("is-invalid");
  }

  longLinkInput.value = "";
});