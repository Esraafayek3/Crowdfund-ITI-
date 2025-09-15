document.addEventListener("DOMContentLoaded", async () => {
  const campaignsList = document.getElementById("campaigns-list");
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const noResultsMessage = document.getElementById("no-results-message");
  const logoutBtn = document.getElementById("logout-btn"); // العناصر الجديدة
  const navbarLinks = document.querySelector(".navbar-links");
  const userDashboardLink = document.getElementById("dashboard-link");
  const createcampaignslink = document.getElementById("create-campaigns-link");

  const API_BASE_URL = "http://localhost:5000";
  let allCampaigns = [];

  // الكود الجديد: التحقق من صلاحيات المستخدم
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  if (loggedInUser && loggedInUser.role === "admin") {
    const adminLink = document.createElement("a");
    adminLink.href = "admin-dashboard.html";
    adminLink.textContent = "Admin Dashboard";
    navbarLinks.insertBefore(adminLink, logoutBtn);
    userDashboardLink.style.display = "none";
    createcampaignslink.style.display = "none";
  }

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns?isApproved=true`);
      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }
      allCampaigns = await response.json();
      displayCampaigns(allCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      campaignsList.innerHTML = `<p>An error occurred while loading campaigns. Please try again later.</p>`;
    }
  };
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
  const displayCampaigns = (campaigns) => {
    campaignsList.innerHTML = "";
    if (campaigns.length === 0) {
      noResultsMessage.style.display = "block";
    } else {
      noResultsMessage.style.display = "none";
      campaigns.forEach((campaign) => {
        const campaignCard = document.createElement("a");
        campaignCard.className = "card";
        campaignCard.href = `campaign-details.html?id=${campaign.id}`;

        campaignCard.innerHTML = `
          <img src="${campaign.base64Image || "placeholder.jpg"}" alt="${
          campaign.title
        }">
          <div class="overlay"></div>
          <div class="card-content">
            <p class="card-title">${campaign.title}</p>
          </div>
        `;
        campaignsList.appendChild(campaignCard);
      });
    }
  };

  const filterByCategory = (category) => {
    searchInput.value = "";
    const filteredCampaigns = allCampaigns.filter((campaign) => {
      const campaignCategory = campaign.category
        ? campaign.category.toLowerCase()
        : "";
      return category === "all" || campaignCategory === category;
    });
    displayCampaigns(filteredCampaigns);
  };

  const searchCampaigns = () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    document.querySelector('[data-category="all"]').classList.add("active");
    const searchTerm = searchInput.value.toLowerCase();
    const searchedCampaigns = allCampaigns.filter((campaign) => {
      return (
        campaign.title.toLowerCase().includes(searchTerm) ||
        (campaign.description &&
          campaign.description.toLowerCase().includes(searchTerm))
      );
    });
    displayCampaigns(searchedCampaigns);
  };

  searchBtn.addEventListener("click", searchCampaigns);
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      searchCampaigns();
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");
      const category = e.target.dataset.category;
      filterByCategory(category);
    });
  });

  fetchCampaigns();
});
