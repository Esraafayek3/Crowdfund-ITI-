let loggedInUser;

document.addEventListener("DOMContentLoaded", async () => {
  const userNameElement = document.getElementById("user-name");
  const userEmailElement = document.getElementById("user-email");
  const myCampaignsList = document.getElementById("my-campaigns-list");
  const noCampaignsMessage = document.getElementById("no-campaigns-message");
  const pledgesTableBody = document.querySelector("#pledges-table tbody");
  const noPledgesMessage = document.getElementById("no-pledges-message");

  const toggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("navbar-links");

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  const API_BASE_URL = "http://localhost:5000";

  const editModal = document.getElementById("edit-modal");
  const modalCloseBtn = document.querySelector(".modal .close-btn");
  const editForm = document.getElementById("edit-campaign-form");

  const displayCampaigns = (campaigns) => {
    myCampaignsList.innerHTML = "";
    if (campaigns.length > 0) {
      campaigns.forEach((campaign) => {
        const campaignCard = document.createElement("div");
        campaignCard.className = "card";
        const isPending = campaign.status === "pending_review";

        const cardHtml = `
          <a href="campaign-details.html?id=${campaign.id}">
            <img src="${campaign.base64Image || "placeholder.jpg"}" alt="${
          campaign.title
        }">
            <div class="overlay"></div>
            <div class="card-content">
                <p class="card-title">${campaign.title}</p>
                ${
                  isPending
                    ? '<p class="pending-message" style="color: #444; font-size: 14px;">Awaiting Admin Approval</p>'
                    : ""
                }
            </div>
          </a>
          <div class="card-actions">
            <button class="edit-btn" data-id="${campaign.id}" ${
          isPending ? "disabled" : ""
        }>Edit</button>
            <button class="delete-btn" data-id="${campaign.id}" ${
          isPending ? "disabled" : ""
        }>Delete</button>
          </div>
        `;
        campaignCard.innerHTML = cardHtml;
        myCampaignsList.appendChild(campaignCard);
      });

      myCampaignsList.querySelectorAll(".edit-btn").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const campaignId = e.target.dataset.id;
          await openEditModal(campaignId);
        });
      });

      myCampaignsList.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async (e) => {
          const campaignId = e.target.dataset.id;
          if (confirm("Are you sure you want to delete this campaign?")) {
            await deleteCampaign(campaignId);
          }
        });
      });
    } else {
      noCampaignsMessage.style.display = "block";
    }
  };

  const displayPledges = (pledges, allCampaigns) => {
    pledgesTableBody.innerHTML = "";
    if (pledges.length > 0) {
      pledges.forEach((pledge) => {
        const campaignName =
          allCampaigns.find((c) => c.id === pledge.campaignId)?.title ||
          "unknown campaign";
        const pledgeRow = document.createElement("tr");
        pledgeRow.innerHTML = `
            <td>${campaignName}</td>
            <td>$${pledge.amount}</td>
            <td>${
              pledge.rewardId ? `reward #${pledge.rewardId}` : "There is no"
            }</td>
            <td>${new Date().toLocaleDateString()}</td>
        `;
        pledgesTableBody.appendChild(pledgeRow);
      });
    } else {
      noPledgesMessage.style.display = "block";
    }
  };

  const deleteCampaign = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("The campaign has been successfully deleted.");
        window.location.reload();
      } else {
        alert("Failed to delete the campaign.");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      alert("An error occurred while deleting the campaign");
    }
  };

  const openEditModal = async (campaignId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`);
      if (!response.ok) throw new Error("Campaign not found.");
      const campaign = await response.json();

      document.getElementById("campaign-id-input").value = campaign.id;
      document.getElementById("modal-goal").value = campaign.goal;
      document.getElementById("modal-deadline").value = campaign.deadline;

      editModal.style.display = "block";
    } catch (error) {
      console.error("Error fetching campaign for edit:", error);
      alert("An error occurred while loading the campaign data for editing.");
    }
  };

  const closeEditModal = () => {
    editModal.style.display = "none";
  };

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const campaignId = document.getElementById("campaign-id-input").value;
    const updatedData = {
      goal: parseFloat(document.getElementById("modal-goal").value),
      deadline: document.getElementById("modal-deadline").value,
    };
    try {
      const pendingResponse = await fetch(`${API_BASE_URL}/pending_edits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaignId,
          userId: loggedInUser.id,
          editedData: updatedData,
          status: "pending",
          dateRequested: new Date().toISOString(),
        }),
      });
      if (!pendingResponse.ok)
        throw new Error("Failed to submit pending request.");

      const statusUpdateResponse = await fetch(
        `${API_BASE_URL}/campaigns/${campaignId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "pending_review" }),
        }
      );
      if (!statusUpdateResponse.ok)
        throw new Error("Failed to update campaign status.");

      alert(
        "Your edit request has been submitted and is awaiting admin approval."
      );
      closeEditModal();

      const updatedCampaignsResponse = await fetch(
        `${API_BASE_URL}/campaigns?creatorId=${loggedInUser.id}`
      );
      const updatedUserCampaigns = await updatedCampaignsResponse.json();
      displayCampaigns(updatedUserCampaigns);
    } catch (error) {
      console.error("Error submitting edit request:", error);
    }
  });

  window.addEventListener("click", (e) => {
    if (e.target === editModal) {
      closeEditModal();
    }
  });

  modalCloseBtn.addEventListener("click", closeEditModal);

  loggedInUser = JSON.parse(localStorage.getItem("user"));

  if (!loggedInUser) {
    alert("You must log in to view this page.");
    window.location.href = "login.html";
    return;
  }

  userNameElement.textContent = loggedInUser.name;
  userEmailElement.textContent = loggedInUser.email;

  try {
    const [campaignsResponse, pledgesResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/campaigns?creatorId=${loggedInUser.id}`),
      fetch(`${API_BASE_URL}/pledges?userId=${loggedInUser.id}`),
    ]);

    const userCampaigns = await campaignsResponse.json();
    const userPledges = await pledgesResponse.json();
    const allCampaignsResponse = await fetch(`${API_BASE_URL}/campaigns`);
    const allCampaigns = await allCampaignsResponse.json();

    displayCampaigns(userCampaigns);
    displayPledges(userPledges, allCampaigns);
  } catch (error) {
    console.error("Error fetching data:", error);
    myCampaignsList.innerHTML = `<p>An error occurred while loading the data.</p>`;
  }
});
