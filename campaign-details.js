document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get("id");

  if (!campaignId) {
    alert("Campaign not found.");
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/campaigns/${campaignId}`
    );
    const campaign = await response.json();

    if (response.ok) {
      document.getElementById("campaign-title").textContent = campaign.title;
      document.getElementById("campaign-description").textContent =
        campaign.description;
      document.getElementById(
        "campaign-goal"
      ).textContent = `$${campaign.goal}`;
      document.getElementById(
        "campaign-raised"
      ).textContent = `$${campaign.currentAmount}`;
      document.getElementById("campaign-deadline").textContent =
        campaign.deadline;

      const campaignImage = document.getElementById("campaign-image");
      if (campaign.base64Image) {
        campaignImage.src = campaign.base64Image;
      } else {
        campaignImage.style.display = "none";
      }

      const rewardsList = document.getElementById("rewards-list");
      if (campaign.rewards && campaign.rewards.length > 0) {
        campaign.rewards.forEach((reward) => {
          const rewardItem = document.createElement("p");
          rewardItem.innerHTML = `<strong>${reward.title}:</strong> $${reward.amount}`;
          rewardsList.appendChild(rewardItem);
        });
      } else {
        rewardsList.innerHTML = `<p>No rewards available for this campaign.</p>`;
      }

      const pledgeButton = document.getElementById("pledge-button");

      if (campaign.isApproved) {
        pledgeButton.disabled = false;
        pledgeButton.style.backgroundColor = "var(--primary-color)";
        pledgeButton.textContent = "Pledge Now!";
      } else {
        pledgeButton.disabled = true;
        pledgeButton.style.backgroundColor = "var(--secondery-color)";
        pledgeButton.textContent = "Pending Admin Approval";
      }
    } else {
      alert("Failed to load campaign details.");
      window.location.href = "index.html";
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An unexpected error occurred while loading campaign details.");
    window.location.href = "index.html";
  }
});
