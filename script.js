const menuToggle = document.getElementById("menu-toggle");

const navLinks = document.getElementById("nav-links");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

const updateNavLinks = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const registerLink = document.getElementById("register-link");

  const loginLink = document.getElementById("login-link");

  const dashboardLink = document.getElementById("dashboard-link");
  const admindashboardlink = document.getElementById("admin-dashboard-link");

  const logoutBtn = document.getElementById("logout-btn");

  const createCampaignBtn = document.querySelector(".hero .btn-primary a");

  if (user) {
    registerLink.style.display = "none";

    loginLink.style.display = "none";
    createCampaignBtn.style.display = "block";

    dashboardLink.style.display = "block";

    logoutBtn.style.display = "block";

    if (user.role === "user") {
      createCampaignBtn.href = "create-campaign.html";
    } else if (user.role === "admin") {
      createCampaignBtn.href = "#";
      createCampaignBtn.addEventListener("click", (event) => {
        event.preventDefault();
        alert(
          "As an admin, you cannot create campaigns. Please use the Admin Dashboard to manage users and campaigns."
        );
      });
      admindashboardlink.style.display = "block";
      dashboardLink.style.display = "none";
    }
  } else {
    registerLink.style.display = "block";

    loginLink.style.display = "block";

    dashboardLink.style.display = "none";

    logoutBtn.style.display = "none";

    createCampaignBtn.href = "login.html";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  updateNavLinks();

  const campaignsContainer = document.getElementById("campaigns-container");

  const campaignsAPI = "http://localhost:5000/campaigns?isApproved=true";

  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");

    updateNavLinks();

    window.location.href = "index.html";
  });

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(campaignsAPI);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const campaigns = await response.json();

      displayCampaigns(campaigns);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);

      campaignsContainer.innerHTML =
        "<p>Failed to load the campaigns. Please try again later.</p>";
    }
  };

  const displayCampaigns = (campaigns) => {
    campaignsContainer.innerHTML = "";

    if (campaigns.length === 0) {
      campaignsContainer.innerHTML =
        "<p>There are no approved campaigns currently.</p>";

      return;
    }

    campaigns.forEach((campaign) => {
      const campaignCard = document.createElement("a");

      campaignCard.className = "card";

      campaignCard.href = `campaign-details.html?id=${campaign.id}`;

      const base64Image = campaign.base64Image;

      const imageUrl = base64Image ? base64Image : "placeholder.jpg";

      campaignCard.innerHTML = `

 <img src="${imageUrl}" alt="${campaign.title}">

<div class="overlay"></div>

 <div class="card-content">

 <p class="card-title">${campaign.title}</p>

 </div>

 `;

      campaignsContainer.appendChild(campaignCard);
    });
  };

  fetchCampaigns();
});

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    updateNavLinks();
  }
});
