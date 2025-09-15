document.addEventListener("DOMContentLoaded", async () => {
  const usersTableBody = document.querySelector("#users-table tbody");
  const campaignsTableBody = document.querySelector("#campaigns-table tbody");
  const pledgesTableBody = document.querySelector("#pledges-table tbody");
  const logoutBtn = document.getElementById("logout-btn");

  const totalPledgesCard = document.getElementById("total-pledges-card");
  const totalCampaignsCard = document.getElementById("total-campaigns-card");
  const totalUsersCard = document.getElementById("total-users-card");
  const pendingCampaignsCard = document.getElementById(
    "pending-campaigns-card"
  );

  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section");

  const API_BASE_URL = "http://localhost:5000";

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.forEach((nav) => nav.classList.remove("active"));
      sections.forEach((sec) => sec.classList.remove("active"));

      link.classList.add("active");
      const targetId = link.dataset.target;
      document.getElementById(targetId).classList.add("active");
    });
  });

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  if (!loggedInUser || loggedInUser.role !== "admin") {
    alert("Access Denied. You must be an admin to view this page.");
    window.location.href = "login.html";
    return;
  }

  const fetchAndDisplayData = async () => {
    try {
      const handleResponse = async (res) => {
        if (res.status === 204 || res.status === 304) return [];
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        }
        throw new Error(`Failed to fetch data with status: ${res.status}`);
      };

      const [usersRes, campaignsRes, pledgesRes, pendingEditsRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/campaigns`),
          fetch(`${API_BASE_URL}/pledges`),
          fetch(`${API_BASE_URL}/pending_edits`),
        ]);

      const users = await handleResponse(usersRes);
      const campaigns = await handleResponse(campaignsRes);
      const pledges = await handleResponse(pledgesRes);
      const pendingEdits = await handleResponse(pendingEditsRes);

      const campaignsWithPending = campaigns.map((campaign) => {
        const pendingEdit = pendingEdits.find(
          (edit) => edit.campaignId == campaign.id
        );
        return { ...campaign, pendingEdit };
      });

      updateDashboardCards(pledges, campaigns, users, pendingEdits);
      displayUsers(users);
      displayCampaigns(campaignsWithPending, users);
      displayPledges(pledges, users, campaigns);
    } catch (error) {
      console.error("An unhandled error occurred:", error);
    }
  };

  const updateDashboardCards = (pledges, campaigns, users, pendingEdits) => {
    const totalPledges = pledges.reduce(
      (sum, pledge) => sum + pledge.amount,
      0
    );

    totalPledgesCard.textContent = `$${totalPledges.toLocaleString()}`;
    totalCampaignsCard.textContent = campaigns.length;
    totalUsersCard.textContent = users.length;
    pendingCampaignsCard.textContent = pendingEdits.length;
  };

  const displayUsers = (users) => {
    usersTableBody.innerHTML = "";

    users.forEach((user) => {
      if (user.role === "admin") return;

      const userRow = document.createElement("tr");
      userRow.innerHTML = `
        <td>${user.name || "N/A"}</td>
        <td>${user.email || "N/A"}</td>
        <td>${user.isActive ? "Active" : "Banned"}</td>
        <td>
          <button class="actions-btn ${user.isActive ? "ban-btn" : "unban-btn"}"
            data-id="${user.id}"
            data-action="${user.isActive ? "ban" : "unban"}">
            ${user.isActive ? "Ban" : "Unban"}
          </button>
        </td>
      `;
      usersTableBody.appendChild(userRow);
    });

    usersTableBody.querySelectorAll(".actions-btn").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const userId = e.target.dataset.id;
        const action = e.target.dataset.action;
        await banUser(userId, action === "ban" ? false : true);
      });
    });
  };

  const displayCampaigns = (campaigns, users) => {
    campaignsTableBody.innerHTML = "";

    campaigns.forEach((campaign) => {
      const creator = users.find((user) => user.id == campaign.creatorId);
      const creatorName = creator ? creator.name : "Unknown";

      const statusCell = campaign.pendingEdit
        ? `<span class="pending-message">Under Review</span>`
        : campaign.status || "N/A";

      const actionsCell = campaign.pendingEdit
        ? `
            <button class="actions-btn approve-edit-btn" 
              data-id="${campaign.pendingEdit.id}" 
              data-campaign-id="${campaign.id}">
              Approve
            </button>
            <button class="actions-btn reject-btn" data-id="${campaign.pendingEdit.id}">
              Reject
            </button>
          `
        : `
            <button class="actions-btn delete-btn" data-id="${campaign.id}">
              Delete
            </button>
            ${
              campaign.isApproved
                ? ""
                : `<button class="actions-btn approve-new-btn" data-id="${campaign.id}">
                    Approve
                  </button>`
            }
          `;

      const campaignRow = document.createElement("tr");
      campaignRow.innerHTML = `
        <td>${campaign.title || "N/A"}</td>
        <td>$${campaign.goal || 0}</td>
        <td>${statusCell}</td>
        <td>${creatorName}</td>
        <td>${actionsCell}</td>
      `;
      campaignsTableBody.appendChild(campaignRow);
    });

    campaignsTableBody.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const campaignId = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this campaign?")) {
          await deleteCampaign(campaignId);
        }
      });
    });

    campaignsTableBody.querySelectorAll(".reject-btn").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const pendingEditId = e.target.dataset.id;
        await rejectEdit(pendingEditId);
      });
    });

    campaignsTableBody
      .querySelectorAll(".approve-edit-btn")
      .forEach((button) => {
        button.addEventListener("click", async (e) => {
          const pendingEditId = e.target.dataset.id;
          const campaignId = e.target.dataset.campaignId;
          await approveEdit(pendingEditId, campaignId);
        });
      });

    campaignsTableBody
      .querySelectorAll(".approve-new-btn")
      .forEach((button) => {
        button.addEventListener("click", async (e) => {
          const campaignId = e.target.dataset.id;
          await approveNewCampaign(campaignId);
        });
      });
  };

  const displayPledges = (pledges, users, campaigns) => {
    pledgesTableBody.innerHTML = "";

    pledges.forEach((pledge) => {
      const pledger = users.find((u) => u.id === pledge.userId);
      const campaign = campaigns.find((c) => c.id === pledge.campaignId);

      const pledgeRow = document.createElement("tr");
      pledgeRow.innerHTML = `
        <td>$${pledge.amount || 0}</td>
        <td>${campaign ? campaign.title : "Unknown Campaign"}</td>
        <td>${pledger ? pledger.name : "Unknown Donor"}</td>
        <td>${new Date(pledge.date).toLocaleDateString()}</td>
      `;
      pledgesTableBody.appendChild(pledgeRow);
    });
  };

  const banUser = async (userId, isActive) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
        alert("User status updated successfully.");
        await fetchAndDisplayData();
      } else {
        alert("Failed to update user status.");
      }
    } catch (error) {
      console.error("Error banning/unbanning user:", error);
    }
  };

  const approveEdit = async (pendingEditId, campaignId) => {
    try {
      const pendingEdit = await (
        await fetch(`${API_BASE_URL}/pending_edits/${pendingEditId}`)
      ).json();

      const editedData = pendingEdit.editedData;

      const patchRes = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editedData,
          status: "active",
          isApproved: true,
        }),
      });

      const deleteRes = await fetch(
        `${API_BASE_URL}/pending_edits/${pendingEditId}`,
        { method: "DELETE" }
      );

      if (patchRes.ok && deleteRes.ok) {
        alert("Campaign edit approved successfully.");
        await fetchAndDisplayData();
      } else {
        alert("Failed to approve campaign edit.");
      }
    } catch (error) {
      console.error("Error approving edit:", error);
    }
  };

  const rejectEdit = async (pendingEditId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/pending_edits/${pendingEditId}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        alert("Edit rejected successfully.");
        await fetchAndDisplayData();
      } else {
        alert("Failed to reject the edit.");
      }
    } catch (error) {
      console.error("Error rejecting edit:", error);
    }
  };

  const deleteCampaign = async (campaignId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Campaign deleted successfully.");
        await fetchAndDisplayData();
      } else {
        alert("Failed to delete campaign.");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  const approveNewCampaign = async (campaignId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true, status: "active" }),
      });
      if (res.ok) {
        alert("Campaign approved successfully.");
        await fetchAndDisplayData();
      } else {
        alert("Failed to approve the campaign.");
      }
    } catch (error) {
      console.error("Error approving new campaign:", error);
    }
  };

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  fetchAndDisplayData();
});
